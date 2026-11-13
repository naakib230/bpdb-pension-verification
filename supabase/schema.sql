-- ============================================================================
-- BPDB (Bangladesh Power Development Board) Pension Management
-- Database Schema, RLS Security Policies, Storage Buckets & Seed Data
-- ============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. Create 'pensioners' table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pensioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pension_id VARCHAR(30) UNIQUE NOT NULL,            -- e.g., 'BPDB-100452'
    nid_number VARCHAR(20) UNIQUE NOT NULL,            -- National Identity Number (10 or 17 digits)
    full_name_en VARCHAR(120) NOT NULL,
    full_name_bn VARCHAR(120) NOT NULL,
    designation_en VARCHAR(100) NOT NULL,              -- e.g. 'Senior Sub-Assistant Engineer'
    designation_bn VARCHAR(100) NOT NULL,              -- e.g. 'সিনিয়র উপ-সহকারী প্রকৌশলী'
    department_en VARCHAR(120) NOT NULL,              -- e.g. 'Distribution Division - Chattogram'
    department_bn VARCHAR(120) NOT NULL,              -- e.g. 'বিতরণ বিভাগ - চট্টগ্রাম'
    retirement_date DATE NOT NULL,
    monthly_pension_amount NUMERIC(12, 2) NOT NULL,    -- Monthly disbursement in BDT
    phone_number VARCHAR(20) NOT NULL,
    reference_photo_url TEXT,                          -- Supabase Storage URL for enrolled reference photo
    reference_face_embedding JSONB,                    -- Precomputed 128-D or 512-D face vector descriptor
    
    -- Device-bound Biometric Enrollment
    biometric_enrolled BOOLEAN DEFAULT FALSE,
    biometric_device_hash TEXT,                        -- Salted SHA-256 / HMAC of device-bound secret
    biometric_device_id TEXT,                          -- Unique device hardware identifier
    biometric_enrolled_at TIMESTAMPTZ,
    
    -- Monthly Verification State
    pension_status VARCHAR(20) DEFAULT 'due',          -- 'verified', 'due', 'suspended'
    last_verified_at TIMESTAMPTZ,
    last_verified_method VARCHAR(20),                  -- 'fingerprint', 'face'
    verification_month VARCHAR(7),                     -- e.g. '2026-11'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Create 'verification_logs' table (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pensioner_id UUID NOT NULL REFERENCES public.pensioners(id) ON DELETE CASCADE,
    pension_id VARCHAR(30) NOT NULL,
    verification_method VARCHAR(20) NOT NULL,          -- 'fingerprint', 'face'
    verification_status VARCHAR(20) NOT NULL,          -- 'approved', 'rejected'
    confidence_score NUMERIC(5, 4) NOT NULL,           -- Similarity score (0.0000 - 1.0000)
    liveness_score NUMERIC(5, 4) DEFAULT 1.0000,       -- Liveness confidence score
    latitude NUMERIC(10, 7),                           -- Captured GPS Latitude
    longitude NUMERIC(10, 7),                          -- Captured GPS Longitude
    location_address TEXT,                             -- Reverse-geocoded place name (e.g. 'Dhaka, Bangladesh')
    captured_photo_url TEXT,                           -- Storage URL of live selfie (if face method)
    device_info JSONB,                                 -- Model, OS version, app version, IP
    failure_reason TEXT,                               -- Explanation if status is 'rejected'
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Create Indexes for High Performance Lookup
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pensioners_pension_id ON public.pensioners(pension_id);
CREATE INDEX IF NOT EXISTS idx_pensioners_nid_number ON public.pensioners(nid_number);
CREATE INDEX IF NOT EXISTS idx_verification_logs_pensioner ON public.verification_logs(pensioner_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_at ON public.verification_logs(verified_at DESC);

-- ============================================================================
-- 5. Trigger for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pensioners_updated_at ON public.pensioners;
CREATE TRIGGER trigger_pensioners_updated_at
BEFORE UPDATE ON public.pensioners
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. Storage Buckets Configuration
-- ============================================================================
-- Create storage buckets for reference photos and verification snapshots
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('pensioner-photos', 'pensioner-photos', true),
    ('verification-selfies', 'verification-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read for Reference Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pensioner-photos');

CREATE POLICY "Service Role Full Access Reference Photos"
ON storage.objects FOR ALL
USING (bucket_id = 'pensioner-photos');

CREATE POLICY "Service Role Full Access Verification Selfies"
ON storage.objects FOR ALL
USING (bucket_id = 'verification-selfies');

-- ============================================================================
-- 7. Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.pensioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to pensioners by pension_id & nid_number for login/profile
CREATE POLICY "Allow public read for pensioner lookup"
ON public.pensioners FOR SELECT
USING (true);

-- Allow service role and Edge functions full update access
CREATE POLICY "Allow service role update on pensioners"
ON public.pensioners FOR ALL
USING (true)
WITH CHECK (true);

-- Allow reading verification logs for a pensioner
CREATE POLICY "Allow read verification logs"
ON public.verification_logs FOR SELECT
USING (true);

-- Allow inserting verification logs from mobile app / edge functions
CREATE POLICY "Allow insert verification logs"
ON public.verification_logs FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 8. Seed Data: Realistic BPDB Pensioners
-- ============================================================================
INSERT INTO public.pensioners (
    pension_id,
    nid_number,
    full_name_en,
    full_name_bn,
    designation_en,
    designation_bn,
    department_en,
    department_bn,
    retirement_date,
    monthly_pension_amount,
    phone_number,
    reference_photo_url,
    biometric_enrolled,
    biometric_device_hash,
    pension_status,
    verification_month
) VALUES
(
    'BPDB-100452',
    '19582691234567890',
    'Md. Rafiqul Islam',
    'মোঃ রফিকুল ইসলাম',
    'Senior Sub-Assistant Engineer',
    'সিনিয়র উপ-সহকারী প্রকৌশলী',
    'Distribution Division - Chattogram Central',
    'বিতরণ বিভাগ - চট্টগ্রাম কেন্দ্রীয়',
    '2018-06-30',
    42850.00,
    '+8801711234567',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    false,
    NULL,
    'due',
    '2026-11'
),
(
    'BPDB-200873',
    '19612699876543210',
    'Begum Rokeya Sultana',
    'বেগম রোকেয়া সুলতানা',
    'Senior Accounts Officer',
    'সিনিয়র হিসাবরক্ষণ কর্মকর্তা',
    'Finance & Revenue Wing - Dhaka Headquarters',
    'অর্থ ও রাজস্ব উইং - ঢাকা সদর দপ্তর',
    '2021-03-31',
    49300.00,
    '+8801819876543',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    true,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'verified',
    '2026-11'
),
(
    'BPDB-305119',
    '19552695556667770',
    'Kazi Shamsul Alam',
    'কাজী শামসুল আলম',
    'Executive Engineer (Generation)',
    'নির্বাহী প্রকৌশলী (বিদ্যুৎ উৎপাদন)',
    'Ghorashal Power Station - Narsingdi',
    'ঘোড়াশাল বিদ্যুৎ কেন্দ্র - নরসিংদী',
    '2015-12-31',
    58200.00,
    '+8801914567890',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    false,
    NULL,
    'due',
    '2026-11'
)
ON CONFLICT (pension_id) DO NOTHING;

-- Initial sample verification log
INSERT INTO public.verification_logs (
    pensioner_id,
    pension_id,
    verification_method,
    verification_status,
    confidence_score,
    latitude,
    longitude,
    location_address,
    device_info
)
SELECT 
    id,
    pension_id,
    'fingerprint',
    'approved',
    1.0000,
    23.8103,
    90.4125,
    'Motijheel C/A, Dhaka, Bangladesh',
    '{"os": "Android", "model": "Samsung SM-G998B", "appVersion": "1.0.0"}'::jsonb
FROM public.pensioners
WHERE pension_id = 'BPDB-200873'
LIMIT 1;
