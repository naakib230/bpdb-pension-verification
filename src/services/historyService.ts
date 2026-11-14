import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { VerificationReceipt, VerificationLog } from '../types';
import { supabase } from '../lib/supabase';

const HISTORY_STORAGE_KEY = '@bpdb_verification_history';
const ENROLLED_PREFIX = '@bpdb_biometric_enrolled_';
const SECURE_KEY_PREFIX = 'bpdb_pension_biometric_token_';

/**
 * Save a newly approved verification receipt into local offline persistent storage
 */
export async function saveVerificationReceipt(receipt: VerificationReceipt): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    const existing: VerificationLog[] = raw ? JSON.parse(raw) : [];

    const newLog: VerificationLog = {
      id: receipt.verification_id,
      pensioner_id: receipt.pension_id,
      pension_id: receipt.pension_id,
      verification_method: receipt.method,
      verification_status: receipt.status,
      confidence_score: receipt.confidence_score,
      latitude: receipt.latitude,
      longitude: receipt.longitude,
      location_address: receipt.location_address,
      verified_at: receipt.verified_at,
    };

    // Prepend to top of list and keep last 20
    const updated = [newLog, ...existing.filter((item) => item.id !== newLog.id)].slice(0, 20);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save verification receipt to local history:', err);
  }
}

/**
 * Retrieve verification records from local storage and remote database
 */
export async function getVerificationHistory(pensionId: string): Promise<VerificationLog[]> {
  const localLogs: VerificationLog[] = [];

  try {
    const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed: VerificationLog[] = JSON.parse(raw);
      localLogs.push(...parsed.filter((log) => log.pension_id === pensionId));
    }
  } catch (err) {
    console.warn('Error reading local history:', err);
  }

  // Attempt to fetch from remote Supabase if connected
  try {
    const { data, error } = await supabase
      .from('verification_logs')
      .select('*')
      .eq('pension_id', pensionId)
      .order('verified_at', { ascending: false })
      .limit(10);

    if (data && !error && data.length > 0) {
      const remoteLogs = data as VerificationLog[];
      // Merge unique logs
      const map = new Map<string, VerificationLog>();
      for (const log of [...localLogs, ...remoteLogs]) {
        map.set(log.id, log);
      }
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.verified_at).getTime() - new Date(a.verified_at).getTime()
      );
    }
  } catch (err) {
    // Network or server unavailable - use local logs
  }

  if (localLogs.length > 0) {
    return localLogs;
  }

  // Initial demo audit logs for new pensioner
  return [
    {
      id: `DEMO-LOG-1-${pensionId}`,
      pensioner_id: pensionId,
      pension_id: pensionId,
      verification_method: 'fingerprint',
      verification_status: 'approved',
      confidence_score: 1.0,
      latitude: 23.8103,
      longitude: 90.4125,
      location_address: 'মতিঝিল, ঢাকা, বাংলাদেশ (BPDB HQ)',
      verified_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ];
}

/**
 * Check if the pensioner has enrolled fingerprint biometrics locally or on device
 */
export async function checkLocalEnrollment(pensionId: string): Promise<boolean> {
  try {
    const flag = await AsyncStorage.getItem(`${ENROLLED_PREFIX}${pensionId}`);
    if (flag === 'true') return true;

    const token = await SecureStore.getItemAsync(`${SECURE_KEY_PREFIX}${pensionId}`);
    if (token) return true;
  } catch (err) {
    // Ignore error
  }
  return false;
}

/**
 * Mark pensioner biometric as enrolled locally
 */
export async function markLocalEnrollment(pensionId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${ENROLLED_PREFIX}${pensionId}`, 'true');
  } catch (err) {
    console.warn('Failed to set local enrollment flag:', err);
  }
}
