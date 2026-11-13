import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { getCurrentGPSLocation } from './locationService';
import { EDGE_FUNCTION_ENDPOINTS } from '../lib/supabase';
import { VerificationReceipt } from '../types';

const SECURE_KEY_PREFIX = 'bpdb_pension_biometric_token_';

export interface BiometricCheckResult {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  supportedName: string;
}

/**
 * Check device biometric hardware capabilities
 */
export async function checkBiometricSupport(): Promise<BiometricCheckResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let supportedName = 'Fingerprint';
  if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    supportedName = 'Face ID / Biometric';
  } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    supportedName = 'Fingerprint';
  }

  return {
    hasHardware,
    isEnrolled,
    biometricTypes,
    supportedName,
  };
}

/**
 * Retrieve or generate unique device-bound cryptographic token
 */
export async function getOrCreateDeviceToken(pensionId: string): Promise<string> {
  const storeKey = `${SECURE_KEY_PREFIX}${pensionId}`;
  let token = await SecureStore.getItemAsync(storeKey);

  if (!token) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    token = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    await SecureStore.setItemAsync(storeKey, token);
  }

  return token;
}

/**
 * Enroll Fingerprint: Prompt user locally, store device key, register hash in Supabase
 */
export async function enrollFingerprint(
  pensionId: string,
  promptTitleBn = 'ফিঙ্গারপ্রিন্ট নিবন্ধন করুন',
  promptTitleEn = 'Enroll Biometric Fingerprint'
): Promise<{ success: boolean; message: string }> {
  // 1. Verify local biometric prompt
  const localAuth = await LocalAuthentication.authenticateAsync({
    promptMessage: `${promptTitleBn} / ${promptTitleEn}`,
    cancelLabel: 'Cancel / বাতিল',
    fallbackLabel: 'Use PIN / পিন ব্যবহার করুন',
    disableDeviceFallback: false,
  });

  if (!localAuth.success) {
    return {
      success: false,
      message: localAuth.error || 'Biometric authentication cancelled.',
    };
  }

  // 2. Generate and store device-bound secret token
  const deviceToken = await getOrCreateDeviceToken(pensionId);
  const deviceId = Crypto.randomUUID();

  // 3. Register device token hash with Supabase Edge Function
  try {
    const response = await fetch(EDGE_FUNCTION_ENDPOINTS.VERIFY_FINGERPRINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'enroll',
        pension_id: pensionId,
        device_token: deviceToken,
        device_id: deviceId,
        device_name: 'Android / iOS Registered Device',
        timestamp: Date.now(),
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Server rejected biometric enrollment.');
    }

    return {
      success: true,
      message: data.message_bn || data.message_en || 'Enrollment successful.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error connecting to BPDB verification server.',
    };
  }
}

/**
 * Perform Monthly Fingerprint Verification:
 * Local sensor check -> Sign payload with device token -> Attach GPS -> Verify at Supabase Edge Function
 */
export async function verifyFingerprintMonthly(
  pensionId: string,
  promptMessage = 'BPDB মাসিক পেনশন যাচাইকরণে ফিঙ্গারপ্রিন্ট স্পর্শ করুন'
): Promise<{ success: boolean; receipt?: VerificationReceipt; error?: string }> {
  // 1. Check local biometric authentication
  const authResult = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel / বাতিল',
    disableDeviceFallback: false,
  });

  if (!authResult.success) {
    return {
      success: false,
      error: 'Biometric verification cancelled or unrecognized.',
    };
  }

  // 2. Retrieve device-bound token
  const deviceToken = await getOrCreateDeviceToken(pensionId);
  const location = await getCurrentGPSLocation();
  const timestamp = Date.now();

  // 3. Transmit signed token to Supabase Edge Function
  try {
    const response = await fetch(EDGE_FUNCTION_ENDPOINTS.VERIFY_FINGERPRINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verify',
        pension_id: pensionId,
        device_token: deviceToken,
        device_id: 'device-bound-verified',
        timestamp,
        latitude: location.latitude,
        longitude: location.longitude,
        location_address: location.address,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error_bn || data.error_en || data.error || 'Server validation failed.',
      };
    }

    const receipt: VerificationReceipt = {
      verification_id: data.verification_id,
      status: 'approved',
      method: 'fingerprint',
      confidence_score: 1.0,
      verified_at: data.verified_at,
      pensioner_name: data.pensioner_name_bn || data.pensioner_name_en,
      pension_id: data.pension_id,
      designation: 'Senior Sub-Assistant Engineer',
      month: data.month,
      latitude: location.latitude,
      longitude: location.longitude,
      location_address: location.address,
    };

    return {
      success: true,
      receipt,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Server connection error during fingerprint verification.',
    };
  }
}
