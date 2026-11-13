// Supabase Edge Function: verify-fingerprint
// Free & Secure Server-Side Fingerprint Verification for BPDB Pensioners
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import { corsHeaders } from "../_shared/cors.ts";

interface BiometricPayload {
  action: "enroll" | "verify";
  pension_id: string;
  device_token: string;              // Secure unique device-bound token
  signature?: string;                // HMAC-SHA256 signature (action='verify')
  device_id: string;                 // Hardware/UUID identifier
  device_name?: string;              // e.g. "Samsung Galaxy S22"
  timestamp: number;                 // Unix timestamp in ms
  latitude?: number;                 // GPS coordinates
  longitude?: number;
  location_address?: string;
}

// Simple SHA-256 helper in Deno Web Crypto
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BiometricPayload = await req.json();
    const {
      action = "verify",
      pension_id,
      device_token,
      device_id,
      device_name = "Unknown Device",
      timestamp,
      latitude,
      longitude,
      location_address = "Bangladesh",
    } = body;

    if (!pension_id || !device_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters (pension_id, device_token)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Fetch pensioner record
    const { data: pensioner, error: fetchErr } = await supabase
      .from("pensioners")
      .select("*")
      .eq("pension_id", pension_id)
      .single();

    if (fetchErr || !pensioner) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Pensioner not found with provided Pension ID.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Action: INITIAL ENROLLMENT
    if (action === "enroll") {
      // Create a salted hash of the device token to store securely
      const tokenHash = await sha256(`${pension_id}::${device_token}::bpdb_salt_secure`);

      const { error: updateErr } = await supabase
        .from("pensioners")
        .update({
          biometric_enrolled: true,
          biometric_device_hash: tokenHash,
          biometric_device_id: device_id,
          biometric_device_name: device_name,
          biometric_enrolled_at: new Date().toISOString(),
        })
        .eq("id", pensioner.id);

      if (updateErr) {
        throw new Error(`Enrollment update failed: ${updateErr.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message_en: "Biometric fingerprint successfully enrolled on this device.",
          message_bn: "এই ডিভাইসে আপনার ফিঙ্গারপ্রিন্ট সফলভাবে নিবন্ধিত হয়েছে।",
          enrolled_at: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Action: MONTHLY VERIFICATION
    // Anti-replay check: timestamp must be within +/- 5 minutes
    const now = Date.now();
    const timeDiffMs = Math.abs(now - timestamp);
    if (timeDiffMs > 5 * 60 * 1000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verification expired or invalid timestamp. Please retry.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!pensioner.biometric_enrolled || !pensioner.biometric_device_hash) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Biometric authentication has not been enrolled on this device yet. Please complete enrollment first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify token hash
    const computedHash = await sha256(`${pension_id}::${device_token}::bpdb_salt_secure`);
    const isTokenValid = computedHash === pensioner.biometric_device_hash;

    if (!isTokenValid) {
      // Log rejected verification
      await supabase.from("verification_logs").insert({
        pensioner_id: pensioner.id,
        pension_id: pensioner.pension_id,
        verification_method: "fingerprint",
        verification_status: "rejected",
        confidence_score: 0.0,
        latitude: latitude || null,
        longitude: longitude || null,
        location_address,
        device_info: { device_id, device_name, timestamp },
        failure_reason: "Device-bound cryptographic biometric token mismatch.",
      });

      return new Response(
        JSON.stringify({
          success: false,
          error_en: "Biometric security token could not be verified. Possible device change.",
          error_bn: "বায়োমেট্রিক নিরাপত্তা টোকেন মিলছে না। অনুগ্রহ করে পুনরায় নিবন্ধন করুন।",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verification Success
    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-11"
    const verifiedAt = new Date().toISOString();

    // 1. Update pensioner status
    await supabase
      .from("pensioners")
      .update({
        pension_status: "verified",
        last_verified_at: verifiedAt,
        last_verified_method: "fingerprint",
        verification_month: currentMonth,
      })
      .eq("id", pensioner.id);

    // 2. Insert audit log
    const { data: logEntry, error: logErr } = await supabase
      .from("verification_logs")
      .insert({
        pensioner_id: pensioner.id,
        pension_id: pensioner.pension_id,
        verification_method: "fingerprint",
        verification_status: "approved",
        confidence_score: 1.0000,
        latitude: latitude || null,
        longitude: longitude || null,
        location_address,
        device_info: { device_id, device_name, timestamp },
      })
      .select()
      .single();

    if (logErr) {
      console.warn("Log insert error:", logErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verification_id: logEntry?.id || crypto.randomUUID(),
        status: "approved",
        confidence_score: 1.0,
        verified_at: verifiedAt,
        pensioner_name_bn: pensioner.full_name_bn,
        pensioner_name_en: pensioner.full_name_en,
        pension_id: pensioner.pension_id,
        month: currentMonth,
        message_en: "Monthly pension verification successfully completed via Fingerprint.",
        message_bn: "ফিঙ্গারপ্রিন্টের মাধ্যমে এই মাসের পেনশন যাচাই সফলভাবে সম্পন্ন হয়েছে।",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Internal server error during biometric verification.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
