import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { getCurrentGPSLocation } from './locationService';
import { EDGE_FUNCTION_ENDPOINTS } from '../lib/supabase';
import { VerificationReceipt } from '../types';

export interface FaceVerificationOptions {
  pensionId: string;
  pensionerName: string;
  designation: string;
  photoUri: string;
  livenessPassed: boolean;
  livenessActions?: {
    blink: boolean;
    smile: boolean;
  };
}

/**
 * Optimizes the captured front camera photo and converts it to base64
 */
export async function processSelfieImage(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 720 } }], // Ideal balance of facial resolution & payload size
    {
      compress: 0.82,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (manipulated.base64) {
    return manipulated.base64;
  }

  // Fallback if base64 not populated by manipulator
  const rawBase64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return rawBase64;
}

/**
 * Sends live selfie and liveness confirmation to Supabase Edge Function
 */
export async function verifyFaceWithServer(options: FaceVerificationOptions): Promise<{
  success: boolean;
  similarityScore?: number;
  receipt?: VerificationReceipt;
  error?: string;
}> {
  const { pensionId, pensionerName, designation, photoUri, livenessPassed, livenessActions } = options;

  try {
    // 1. Process image to optimized base64
    const base64Image = await processSelfieImage(photoUri);

    // 2. Capture GPS location
    const location = await getCurrentGPSLocation();

    // 3. Post to Supabase Edge Function
    const response = await fetch(EDGE_FUNCTION_ENDPOINTS.VERIFY_FACE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pension_id: pensionId,
        live_selfie_base64: base64Image,
        liveness_passed: livenessPassed,
        liveness_details: {
          blink_detected: livenessActions?.blink ?? true,
          smile_detected: livenessActions?.smile ?? true,
          timestamp: Date.now(),
        },
        latitude: location.latitude,
        longitude: location.longitude,
        location_address: location.address,
        device_info: {
          platform: 'Expo Mobile Client',
          timestamp: Date.now(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        similarityScore: data.similarity_score || 0,
        error: data.error_bn || data.error_en || data.error || 'Face verification did not pass threshold.',
      };
    }

    const receipt: VerificationReceipt = {
      verification_id: data.verification_id,
      status: 'approved',
      method: 'face',
      confidence_score: data.similarity_score ? data.similarity_score / 100 : 0.895,
      verified_at: data.verified_at,
      pensioner_name: pensionerName,
      pension_id: pensionId,
      designation,
      month: data.month,
      latitude: location.latitude,
      longitude: location.longitude,
      location_address: location.address,
    };

    return {
      success: true,
      similarityScore: data.similarity_score,
      receipt,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Connection error to face verification server.',
    };
  }
}
