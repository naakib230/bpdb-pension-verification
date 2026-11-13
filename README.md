# ⚡ BPDB Pension Management & Biometric Verification App
### বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (বিপিডিবি) - ডিজিটাল পেনশন ব্যবস্থাপনা ও বায়োমেট্রিক যাচাইকরণ মোবাইল অ্যাপ

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_52-006A4E.svg?style=flat&logo=react)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase_PostgreSQL-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![Free/Open-Source](https://img.shields.io/badge/Biometrics-100%25_Free_&_Open_Source-D90429.svg)](#)

---

## 📋 Table of Contents
1. [Executive Summary & Architecture](#-executive-summary--architecture)
2. [Key Features & Senior-Friendly UI/UX](#-key-features--senior-friendly-uiux)
3. [Zero-Cost Biometric & Face Verification Design](#-zero-cost-biometric--face-verification-design)
4. [Supabase Database Schema & RLS Setup](#-supabase-database-schema--rls-setup)
5. [Supabase Edge Functions Deployment](#-supabase-edge-functions-deployment)
6. [Local Development & Running the App](#-local-development--running-the-app)
7. [Building Production Releases (EAS Build)](#-building-production-releases-eas-build)
   - [Android .apk (Testing & Sideloading)](#1-generate-standalone-android-apk-for-testing)
   - [Android .aab (Google Play Store)](#2-generate-production-android-aab-for-google-play)
   - [iOS Build (Apple App Store)](#3-generate-ios-build-for-app-store)
8. [Permissions & Compliance Configuration](#-permissions--compliance-configuration)
9. [Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)

---

## 🏛 Executive Summary & Architecture

The **BPDB Pension Verification App** is a mission-critical cross-platform mobile application designed specifically for senior retired officials of the **Bangladesh Power Development Board (BPDB)**. It allows pensioners to fulfill their mandatory monthly physical appearance/verification remotely using their smartphone.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               EXPO REACT NATIVE CLIENT                 │
                    │   - Senior-Friendly Accessible UI (English & বাংলা)   │
                    │   - High Contrast Themes & Extra-Large Buttons         │
                    └───────────────┬────────────────────────┬───────────────┘
                                    │                        │
       1. Fingerprint Flow          │                        │  2. Face Matching Flow
   ┌────────────────────────────────┴────────┐      ┌────────┴────────────────────────┐
   │ - expo-local-authentication (TouchID)   │      │ - expo-camera (Front Facing)    │
   │ - expo-secure-store (Device Key)        │      │ - Liveness Oval Overlay (Mask)  │
   │ - GPS Coordinates via expo-location     │      │ - 3-Step Anti-Spoof Prompts     │
   └────────────────┬────────────────────────┘      └────────┬────────────────────────┘
                    │                                        │
                    ▼                                        ▼
    ┌───────────────────────────────┐        ┌───────────────────────────────┐
    │     SUPABASE EDGE FUNCTION    │        │     SUPABASE EDGE FUNCTION    │
    │     /v1/verify-fingerprint    │        │     /v1/verify-face           │
    │   - Replay protection (<5min) │        │   - Compares Reference Photo  │
    │   - Cryptographic token check │        │   - Enforces >= 85% Threshold │
    │   - Updates verification log  │        │   - Stores audit selfie       │
    └───────────────┬───────────────┘        └───────────────┬───────────────┘
                    │                                        │
                    └───────────────────┬────────────────────┘
                                        ▼
                    ┌────────────────────────────────────────┐
                    │      SUPABASE POSTGRESQL DATABASE      │
                    │   - pensioners table                   │
                    │   - verification_logs audit trail      │
                    │   - Storage: pensioner-photos          │
                    └────────────────────────────────────────┘
```

---

## ♿ Key Features & Senior-Friendly UI/UX

1. **Accessibility for Elderly Pensioners**:
   - High-contrast visual palette inspired by BPDB's official colors (`#006A4E` deep forest green, `#D90429` crimson red, `#D48806` power gold).
   - Extra-large touch targets (minimum 58px–64px button heights).
   - Crisp, large typography (20px body, 24px–32px headings).
2. **True Bilingual Support (English & বাংলা)**:
   - One-tap language switcher (`বাংলা` / `ENG`) fixed in the persistent top bar.
   - Comprehensive translations across all alerts, guidance banners, error messages, and digital certificates.
3. **Monthly Disbursement Status Banner**:
   - Clear visual status callout: Green `✓` when verified for current month, Amber `!` with due warning when pending.
4. **Official Digital Verification Certificate**:
   - Digital verifiable receipt with verification transaction ID, GPS location stamp, date & time, and printable/shareable summary.

---

## 🔒 Zero-Cost Biometric & Face Verification Design

### 1. Server-Side Fingerprint Verification (No Paid Services)
- **Enrollment**: Authenticates user locally using `expo-local-authentication`. Generates a 256-bit cryptographically secure device secret via `expo-crypto`, saves the private secret in hardware-backed `expo-secure-store`, and registers the salted SHA-256 hash in the Supabase `pensioners` table.
- **Monthly Verification**: On sensor touch, signs a timestamped payload with current GPS coordinates and transmits to the `verify-fingerprint` Supabase Edge Function. The server enforces a 5-minute anti-replay freshness window, compares against the registered hash, logs the audit record, and updates the pensioner's status to `verified`.

### 2. Server-Side Face Verification with Liveness Anti-Spoofing
- **Client Camera**: Uses `expo-camera` with an interactive SVG face-guide oval overlay.
- **Active Liveness Prompts**: Multi-step automated guidance:
  1. *Step 1*: Look straight into camera (সোজা তাকান)
  2. *Step 2*: Blink eyes naturally (চোখের পলক ফেলুন)
  3. *Step 3*: Smile gently (একটু হাসুন)
- **Face Matching Engine**: Compares the live selfie against the official reference photo stored in Supabase Storage (`pensioner-photos/{pension_id}.jpg`).
- **Free/Open-Source Stack**: Implemented via `@vladmandic/human` / `face-api.js` face embedding descriptors (cosine similarity and normalized Euclidean distance).
- **Strict Compliance**: Approved **only if face similarity score is >= 85.0%**. Scores below 85% are logged with a failure reason and the pensioner is guided to retry with proper lighting.

---

## 🗄 Supabase Database Schema & RLS Setup

Execute the provided SQL script in your Supabase SQL Editor (`c:\xampp\htdocs\verification-app\supabase\schema.sql`):

```sql
-- 1. Run schema.sql in Supabase Dashboard -> SQL Editor
-- Tables created:
--   - public.pensioners (Profiles, NID, Pension ID, Biometric Hashes)
--   - public.verification_logs (Immutable audit trail with GPS & scores)
--   - storage.buckets ('pensioner-photos', 'verification-selfies')
```

### Key Tables Overview:
| Table Name | Description | Key Columns |
|------------|-------------|-------------|
| `pensioners` | Master pensioner records | `pension_id`, `nid_number`, `full_name_bn`, `biometric_device_hash`, `pension_status`, `monthly_pension_amount` |
| `verification_logs` | Audit trail for every verification attempt | `pensioner_id`, `verification_method`, `verification_status`, `confidence_score`, `latitude`, `longitude`, `verified_at` |

---

## 🚀 Supabase Edge Functions Deployment

Deploy the two serverless Edge Functions to your Supabase project:

```bash
# 1. Login to Supabase CLI
npx supabase login

# 2. Link your Supabase project
npx supabase link --project-ref your-project-id

# 3. Deploy the fingerprint verification function
npx supabase functions deploy verify-fingerprint --no-verify-jwt

# 4. Deploy the face verification function
npx supabase functions deploy verify-face --no-verify-jwt

# 5. Set secrets
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### (Optional) Self-Hosted Face Service Microservice:
If you want to run the dedicated open-source Node.js face descriptor engine:
```bash
cd face-service
npm install
npm start
# Set FACE_SERVICE_URL in Supabase secrets:
# npx supabase secrets set FACE_SERVICE_URL="http://your-server-ip:8080"
```

---

## 💻 Local Development & Running the App

### 1. Install Dependencies
```bash
cd c:\xampp\htdocs\verification-app
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase URL and Anon Key:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
```

### 3. Start the Expo Dev Server
```bash
pnpm start
```
- Press `a` to open on Android Emulator or connected device.
- Press `i` to open on iOS Simulator.
- Scan the QR code using the **Expo Go** app on your physical device.

---

## 📦 Building Production Releases (EAS Build)

### Prerequisites:
Install EAS CLI globally and log in:
```bash
npm install -g eas-cli
eas login
```

Configure your project ID:
```bash
eas init
```

---

### 1. Generate Standalone Android .APK (For Testing)
Generate a standalone installable `.apk` file that can be distributed directly to field testers and pensioners via WhatsApp, email, or direct download without Google Play:

```bash
eas build -p android --profile preview
```
*Output: Downloadable standalone `.apk` URL upon completion.*

---

### 2. Generate Production Android .AAB (For Google Play)
Generate the optimized Android App Bundle (`.aab`) signed for publication on the Google Play Console:

```bash
eas build -p android --profile production
```
*Output: Production `.aab` file ready for upload to Google Play.*

---

### 3. Generate iOS Build (For App Store)
Generate the production IPA for Apple App Store TestFlight and public release:

```bash
eas build -p ios --profile production
```
*Output: App Store distribution package submitted to Apple TestFlight / App Store Connect.*

---

## 🛡 Permissions & Compliance Configuration

All permissions in `app.json` include explicit user-facing justifications in both English and Bangla:

### Android (`AndroidManifest.xml` via `app.json`):
- `android.permission.CAMERA`: Required for front camera selfie capture and liveness detection.
- `android.permission.USE_BIOMETRIC`: Required for hardware biometric authentication.
- `android.permission.USE_FINGERPRINT`: Legacy support for older Android fingerprint sensors.
- `android.permission.ACCESS_FINE_LOCATION`: Required to verify geographical location during verification.
- `android.permission.ACCESS_COARSE_LOCATION`: Fallback network-based location.

### iOS (`Info.plist` via `app.json`):
- `NSCameraUsageDescription`: *"BPDB Pensioner Verification requires camera access for facial matching and anti-spoofing liveness checks. / মুখমণ্ডল যাচাই ও লাইভনেস পরীক্ষার জন্য ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন।"*
- `NSFaceIDUsageDescription`: *"BPDB Pensioner Verification uses biometric authentication to verify your identity securely. / নিরাপদ পরিচয় যাচাইয়ের জন্য বায়োমেট্রিক ও ফেস আইডি ব্যবহারের অনুমতি প্রয়োজন।"*
- `NSLocationWhenInUseUsageDescription`: *"BPDB Pensioner Verification requires your location to confirm geographical presence during monthly pension verification. / মাসিক পেনশন যাচাইকরণের সময় আপনার ভৌগোলিক অবস্থান নিশ্চিত করতে লোকেশন অনুমতি প্রয়োজন।"*

---

## 👥 Pre-Seeded Test Credentials

You can test immediately using the built-in one-tap demo profiles on the login screen or by entering these credentials:

| Pension ID | NID Number | Pensioner Name | Designation | Current Status |
|------------|------------|----------------|-------------|----------------|
| `BPDB-100452` | `19582691234567890` | মোঃ রফিকুল ইসলাম (Md. Rafiqul Islam) | Senior Sub-Assistant Engineer | ⚠️ Verification Due |
| `BPDB-200873` | `19612699876543210` | বেগম রোকেয়া সুলতানা (Begum Rokeya Sultana) | Senior Accounts Officer | ✓ Verified |
| `BPDB-305119` | `19552695556667770` | কাজী শামসুল আলম (Kazi Shamsul Alam) | Executive Engineer (Generation) | ⚠️ Verification Due |

---

## 📄 License & Ownership
Developed for the **Bangladesh Power Development Board (BPDB)**. 100% Free and Open-Source implementation with zero recurring cloud API charges.
