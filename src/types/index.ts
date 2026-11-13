export type Language = 'en' | 'bn';

export type PensionStatus = 'verified' | 'due' | 'suspended';

export type VerificationMethod = 'fingerprint' | 'face';

export type VerificationStatus = 'approved' | 'rejected';

export interface Pensioner {
  id: string;
  pension_id: string;
  nid_number: string;
  full_name_en: string;
  full_name_bn: string;
  designation_en: string;
  designation_bn: string;
  department_en: string;
  department_bn: string;
  retirement_date: string;
  monthly_pension_amount: number;
  phone_number: string;
  reference_photo_url?: string;
  biometric_enrolled: boolean;
  biometric_device_name?: string;
  pension_status: PensionStatus;
  last_verified_at?: string;
  last_verified_method?: VerificationMethod;
  verification_month?: string;
}

export interface VerificationLog {
  id: string;
  pensioner_id: string;
  pension_id: string;
  verification_method: VerificationMethod;
  verification_status: VerificationStatus;
  confidence_score: number;
  liveness_score?: number;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  captured_photo_url?: string;
  failure_reason?: string;
  verified_at: string;
}

export interface VerificationReceipt {
  verification_id: string;
  status: VerificationStatus;
  method: VerificationMethod;
  confidence_score: number;
  verified_at: string;
  pensioner_name: string;
  pension_id: string;
  designation: string;
  month: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
}

export type LivenessStep = 'look_straight' | 'blink' | 'smile' | 'completed';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
