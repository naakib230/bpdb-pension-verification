import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, VerificationReceipt } from '../types';
import { SeniorButton } from '../components/SeniorButton';
import { Header } from '../components/Header';

interface VerificationResultScreenProps {
  receipt: VerificationReceipt;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onReturnToDashboard: () => void;
}

export const VerificationResultScreen: React.FC<VerificationResultScreenProps> = ({
  receipt,
  currentLanguage,
  onLanguageChange,
  onReturnToDashboard,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const formattedDate = new Date(receipt.verified_at).toLocaleDateString(
    currentLanguage === 'bn' ? 'bn-BD' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );

  const handleShareReceipt = async () => {
    try {
      const receiptMessage = `
========================================
⚡ BANGLADESH POWER DEVELOPMENT BOARD (BPDB)
বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড
PENSION VERIFICATION CERTIFICATE
========================================
Receipt No: ${receipt.verification_id}
Pensioner Name: ${receipt.pensioner_name}
Pension ID: ${receipt.pension_id}
Designation: ${receipt.designation}
Method: ${receipt.method === 'fingerprint' ? 'Fingerprint (বায়োমেট্রিক)' : 'Face Recognition (মুখমণ্ডল)'}
Confidence: ${(receipt.confidence_score * 100).toFixed(1)}%
Status: APPROVED & DISBURSED (অনুমোদিত)
Date & Time: ${formattedDate}
Location: ${receipt.location_address || 'Dhaka, Bangladesh'}
========================================
Verified via BPDB Pension Mobile Portal
      `.trim();

      await Share.share({
        title: 'BPDB Pension Verification Certificate',
        message: receiptMessage,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t.resultApprovedTitle}
        subtitle={t.orgNameShort}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Certificate Card */}
        <View style={styles.certificateCard}>
          {/* Top Seal Badge */}
          <View style={styles.sealCircle}>
            <Text style={styles.sealCheck}>✓</Text>
          </View>

          <Text style={styles.certificateHeader}>
            {t.certificateHeader}
          </Text>
          <Text style={styles.certificateTagline}>
            {currentLanguage === 'bn'
              ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক অনুমোদিত'
              : 'Approved by Government of the People\'s Republic of Bangladesh'}
          </Text>

          <View style={styles.divider} />

          {/* Key Verification Details */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.refTransactionId}</Text>
            <Text style={styles.receiptIdText}>
              {receipt.verification_id.substring(0, 18).toUpperCase()}...
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptPensionerName}</Text>
            <Text style={styles.detailValue}>{receipt.pensioner_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptPensionId}</Text>
            <Text style={styles.detailValue}>{receipt.pension_id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptMethod}</Text>
            <Text style={styles.detailValue}>
              {receipt.method === 'fingerprint'
                ? '👆 ' + t.methodFingerprint
                : '📸 ' + t.methodFace}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptScore}</Text>
            <Text style={[styles.detailValue, { color: THEME.colors.statusSuccess }]}>
              {(receipt.confidence_score * 100).toFixed(1)}% (Passed ≥ 85%)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptTimestamp}</Text>
            <Text style={styles.detailValueSmall}>{formattedDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.receiptLocation}</Text>
            <Text style={styles.detailValueSmall}>
              {receipt.location_address || 'Dhaka, Bangladesh'}
            </Text>
          </View>

          <View style={styles.statusPillBox}>
            <Text style={styles.statusPillLabel}>{t.receiptStatus}</Text>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>{t.receiptStatusActive}</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <SeniorButton
            title={t.btnDownloadReceipt}
            subtitle="Save or Share"
            onPress={handleShareReceipt}
            variant="gold"
            size="large"
            style={styles.shareBtn}
          />

          <SeniorButton
            title={t.btnReturnHome}
            onPress={onReturnToDashboard}
            variant="primary"
            size="large"
            style={styles.returnBtn}
          />
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
  certificateCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    ...THEME.shadows.cardHover,
    marginBottom: THEME.spacing.lg,
  },
  sealCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.statusSuccess,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    borderWidth: 4,
    borderColor: '#DCFCE7',
  },
  sealCheck: {
    fontSize: 44,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: -4,
  },
  certificateHeader: {
    ...THEME.typography.title2,
    color: THEME.colors.primaryDark,
    textAlign: 'center',
    fontWeight: '800',
  },
  certificateTagline: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1.5,
    backgroundColor: THEME.colors.borderStrong,
    width: '100%',
    marginVertical: THEME.spacing.md,
  },
  detailRow: {
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  detailValueSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  receiptIdText: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  statusPillBox: {
    width: '100%',
    marginTop: THEME.spacing.md,
    alignItems: 'center',
  },
  statusPillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  activePill: {
    backgroundColor: THEME.colors.statusSuccessBg,
    borderWidth: 2,
    borderColor: THEME.colors.statusSuccess,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: THEME.borderRadius.full,
  },
  activePillText: {
    color: THEME.colors.statusSuccess,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  shareBtn: {
    marginBottom: 4,
  },
  returnBtn: {},
});
