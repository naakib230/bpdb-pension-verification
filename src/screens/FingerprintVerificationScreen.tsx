import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, Pensioner, VerificationReceipt } from '../types';
import { SeniorButton } from '../components/SeniorButton';
import { Header } from '../components/Header';
import {
  checkBiometricSupport,
  enrollFingerprint,
  verifyFingerprintMonthly,
} from '../services/biometricService';
import { checkLocalEnrollment } from '../services/historyService';

interface FingerprintVerificationScreenProps {
  pensioner: Pensioner;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onBackPress: () => void;
  onVerificationSuccess: (receipt: VerificationReceipt) => void;
}

export const FingerprintVerificationScreen: React.FC<FingerprintVerificationScreenProps> = ({
  pensioner,
  currentLanguage,
  onLanguageChange,
  onBackPress,
  onVerificationSuccess,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasHardware, setHasHardware] = useState<boolean>(true);
  const [isDeviceEnrolled, setIsDeviceEnrolled] = useState<boolean>(pensioner.biometric_enrolled);

  useEffect(() => {
    async function checkSupport() {
      const result = await checkBiometricSupport();
      setHasHardware(result.hasHardware);
      const isLocal = await checkLocalEnrollment(pensioner.pension_id);
      if (isLocal || pensioner.biometric_enrolled) {
        setIsDeviceEnrolled(true);
      }
    }
    checkSupport();
  }, [pensioner.pension_id, pensioner.biometric_enrolled]);

  const handleEnrollAndVerify = async () => {
    setLoading(true);
    setStatusMessage(t.promptEnrolling);

    try {
      const enrollResult = await enrollFingerprint(
        pensioner.pension_id,
        t.fingerprintScreenTitle,
        'BPDB Pensioner Verification'
      );

      if (!enrollResult.success) {
        Alert.alert(t.error, enrollResult.message || t.fingerprintFailed);
        setLoading(false);
        setStatusMessage('');
        return;
      }

      setIsDeviceEnrolled(true);
      setStatusMessage(t.promptVerifying);

      // Immediately run monthly verification after successful enrollment
      await executeMonthlyVerification();
    } catch (err: any) {
      Alert.alert(t.error, err.message || t.fingerprintFailed);
      setLoading(false);
      setStatusMessage('');
    }
  };

  const executeMonthlyVerification = async () => {
    setLoading(true);
    setStatusMessage(t.promptGpsAcquiring);

    try {
      setStatusMessage(t.promptVerifying);
      const verifyResult = await verifyFingerprintMonthly(
        pensioner,
        currentLanguage === 'bn'
          ? 'বিপিডিবি মাসিক পেনশন যাচাইয়ে সেন্সরে আঙুল রাখুন'
          : 'Place registered finger on sensor for BPDB monthly pension verification'
      );

      if (verifyResult.success && verifyResult.receipt) {
        setStatusMessage(t.fingerprintSuccess);
        // Small delay so pensioner sees confirmation
        setTimeout(() => {
          onVerificationSuccess(verifyResult.receipt!);
        }, 600);
      } else {
        Alert.alert(t.error, verifyResult.error || t.fingerprintFailed);
        setLoading(false);
        setStatusMessage('');
      }
    } catch (err: any) {
      Alert.alert(t.error, err.message || t.fingerprintFailed);
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t.fingerprintScreenTitle}
        subtitle={t.orgNameShort}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        showBack={true}
        onBackPress={onBackPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Sensor Visualizer Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.sensorIcon}>👆</Text>
          </View>

          <Text style={styles.mainTitle}>{t.fingerprintScreenTitle}</Text>
          <Text style={styles.subtitle}>{t.fingerprintScreenSubtitle}</Text>

          {/* Status / Activity Indicator */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text style={styles.loadingText}>{statusMessage}</Text>
            </View>
          ) : (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                {isDeviceEnrolled ? t.promptTouchSensor : t.enrollmentNotice}
              </Text>
            </View>
          )}

          {/* Action Trigger Buttons */}
          <View style={styles.actionContainer}>
            {isDeviceEnrolled ? (
              <SeniorButton
                title={t.btnStartFingerprint}
                subtitle="Touch Device Sensor"
                onPress={executeMonthlyVerification}
                loading={loading}
                variant="primary"
                size="large"
              />
            ) : (
              <SeniorButton
                title={t.btnEnrollFingerprint}
                subtitle="One-time Setup"
                onPress={handleEnrollAndVerify}
                loading={loading}
                variant="gold"
                size="large"
              />
            )}
          </View>
        </View>

        {/* Security & Cryptographic Details Explanation Card */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>
            🔒 {currentLanguage === 'bn' ? 'নিরাপত্তা সংক্রান্ত তথ্য' : 'Biometric Security Protocol'}
          </Text>
          <Text style={styles.securityText}>
            {currentLanguage === 'bn'
              ? '• আপনার আসল আঙুলের ছাপ কখনই ফোন থেকে সার্ভারে পাঠানো হয় না।\n• ডিভাইস-বাউন্ড ক্রিপ্টোগ্রাফিক কি ও জিপিএস টাইমস্ট্যাম্পের মাধ্যমে সার্ভারে যাচাই সম্পন্ন হয়।\n• ১০০% নিরাপদ এবং বাংলাদেশ সরকারের আইসিটি নির্দেশিকা সম্মত।'
              : '• Your actual fingerprint image never leaves your device.\n• A cryptographically signed token + GPS location timestamp is validated on the BPDB server.\n• 100% free, open, and strictly compliant with government data protection guidelines.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    ...THEME.shadows.cardHover,
    marginBottom: THEME.spacing.lg,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  sensorIcon: {
    fontSize: 54,
  },
  mainTitle: {
    ...THEME.typography.title1,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: THEME.spacing.lg,
  },
  loadingBox: {
    backgroundColor: '#F1F5F9',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: THEME.spacing.lg,
  },
  loadingText: {
    ...THEME.typography.bodyLarge,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
    marginTop: 12,
    textAlign: 'center',
  },
  instructionBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: THEME.colors.borderStrong,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    width: '100%',
    marginBottom: THEME.spacing.lg,
  },
  instructionText: {
    ...THEME.typography.body,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
  },
  securityCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.colors.textSecondary,
  },
});
