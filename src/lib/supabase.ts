import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Default configuration for development / production
// In production, configure these via .env or EAS Secrets
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bpdb-pension-demo.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_anon_key';

export const isDemoBackend =
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  SUPABASE_URL.includes('bpdb-pension-demo.supabase.co') ||
  SUPABASE_URL.includes('your-supabase-project-id');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const EDGE_FUNCTION_ENDPOINTS = {
  VERIFY_FINGERPRINT: `${SUPABASE_URL}/functions/v1/verify-fingerprint`,
  VERIFY_FACE: `${SUPABASE_URL}/functions/v1/verify-face`,
};

/**
 * Robust fetch with timeout to prevent hanging on high-latency or offline mobile networks
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Returns localized Bangla/English month name
 */
export function getLocalizedMonth(date = new Date(), lang: 'bn' | 'en' = 'bn'): string {
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthIdx = date.getMonth();
  const year = date.getFullYear();

  if (lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bnYear = year.toString().split('').map(d => bnDigits[+d] || d).join('');
    return `${bnMonths[monthIdx]} ${bnYear}`;
  }
  return `${enMonths[monthIdx]} ${year}`;
}
