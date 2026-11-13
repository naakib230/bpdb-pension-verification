import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Default configuration for development / production
// In production, configure these via .env or EAS Secrets
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bpdb-pension-demo.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_anon_key';

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
