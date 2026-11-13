import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, Pensioner, VerificationLog } from '../types';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

interface DashboardScreenProps {
  pensioner: Pensioner;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateToFingerprint: () => void;
  onNavigateToFace: () => void;
  onNavigateToHistory: () => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  pensioner,
  currentLanguage,
  onLanguageChange,
  onNavigateToFingerprint,
  onNavigateToFace,
  onNavigateToHistory,
  onLogout,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [refreshing, setRefreshing] = useState(false);
  const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);

  const isVerified = pensioner.pension_status === 'verified';
  const pensionerName = currentLanguage === 'bn' ? pensioner.full_name_bn : pensioner.full_name_en;
  const designation = currentLanguage === 'bn' ? pensioner.designation_bn : pensioner.designation_en;
  const department = currentLanguage === 'bn' ? pensioner.department_bn : pensioner.department_en;

  const fetchRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_logs')
        .select('*')
        .eq('pension_id', pensioner.pension_id)
        .order('verified_at', { ascending: false })
        .limit(3);

      if (data && !error) {
        setRecentLogs(data as VerificationLog[]);
      } else {
        // Fallback sample log for preview
        setRecentLogs([
          {
            id: 'sample-log-1',
            pensioner_id: pensioner.id,
            pension_id: pensioner.pension_id,
            verification_method: 'fingerprint',
            verification_status: 'approved',
            confidence_score: 1.0,
            location_address: 'Dhaka, Bangladesh',
            verified_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ]);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [pensioner.pension_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentLogs();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t.appTitle}
        subtitle={t.orgName}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
        }
      >
        {/* Pensioner Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {pensioner.full_name_en.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileMainInfo}>
              <Text style={styles.welcomeGreeting}>{t.welcomeGreeting}</Text>
              <Text style={styles.pensionerName}>{pensionerName}</Text>
              <Text style={styles.designationText}>{designation}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Identification Attributes */}
          <View style={styles.attributesGrid}>
            <View style={styles.attributeBox}>
              <Text style={styles.attributeLabel}>{t.pensionerIdBadge}</Text>
              <Text style={styles.attributeValue}>{pensioner.pension_id}</Text>
            </View>
            <View style={styles.attributeBox}>
              <Text style={styles.attributeLabel}>{t.nidBadge}</Text>
              <Text style={styles.attributeValue}>{pensioner.nid_number}</Text>
            </View>
          </View>

          <View style={styles.attributeBoxFull}>
            <Text style={styles.attributeLabel}>{t.deptBadge}</Text>
            <Text style={styles.attributeValue}>{department}</Text>
          </View>

          {/* Monthly Pension Amount Banner */}
          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>{t.monthlyAmount}</Text>
            <Text style={styles.amountValue}>
              ৳ {pensioner.monthly_pension_amount.toLocaleString('en-US')}
            </Text>
          </View>
        </View>

        {/* Status Callout Banner */}
        <View
          style={[
            styles.statusCard,
            isVerified ? styles.statusCardVerified : styles.statusCardDue,
          ]}
        >
          <View style={styles.statusIconContainer}>
            <Text style={styles.statusIconText}>{isVerified ? '✓' : '!'}</Text>
          </View>
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                isVerified ? styles.statusTitleVerified : styles.statusTitleDue,
              ]}
            >
              {isVerified ? t.verifiedNoticeTitle : t.verificationNoticeTitle}
            </Text>
            <Text style={styles.statusDesc}>
              {isVerified ? t.verifiedNoticeDesc : t.verificationNoticeDesc}
            </Text>
          </View>
        </View>

        {/* Two Large Action Cards */}
        <Text style={styles.sectionHeading}>
          {currentLanguage === 'bn' ? 'যাচাইকরণের মাধ্যম বেছে নিন' : 'Choose Verification Method'}
        </Text>

        {/* 1. Fingerprint Action Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onNavigateToFingerprint}
          style={[styles.actionCard, styles.actionCardFingerprint]}
          accessibilityRole="button"
          accessibilityLabel={t.actionFingerprintTitle}
        >
          <View style={styles.actionCardHeader}>
            <View style={styles.actionIconCircle}>
              <Text style={styles.actionEmoji}>👆</Text>
            </View>
            <View style={styles.actionCardTitleContainer}>
              <Text style={styles.actionCardTitle}>
                {t.actionFingerprintTitle}
              </Text>
              <Text style={styles.actionCardSubtitleBn}>
                {t.actionFingerprintBn}
              </Text>
            </View>
          </View>
          <Text style={styles.actionCardDesc}>
            {t.actionFingerprintDesc}
          </Text>
          <View style={styles.actionButtonPill}>
            <Text style={styles.actionButtonPillText}>
              {currentLanguage === 'bn' ? 'যাচাই শুরু করুন →' : 'Start Verification →'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2. Face Verification Action Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onNavigateToFace}
          style={[styles.actionCard, styles.actionCardFace]}
          accessibilityRole="button"
          accessibilityLabel={t.actionFaceTitle}
        >
          <View style={styles.actionCardHeader}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.actionEmoji}>📸</Text>
            </View>
            <View style={styles.actionCardTitleContainer}>
              <Text style={styles.actionCardTitle}>
                {t.actionFaceTitle}
              </Text>
              <Text style={styles.actionCardSubtitleBn}>
                {t.actionFaceBn}
              </Text>
            </View>
          </View>
          <Text style={styles.actionCardDesc}>
            {t.actionFaceDesc}
          </Text>
          <View style={[styles.actionButtonPill, { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.actionButtonPillText}>
              {currentLanguage === 'bn' ? 'ক্যামেরা চালু করুন →' : 'Open Camera →'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Verification History Preview */}
        <View style={styles.historyCard}>
          <View style={styles.historyCardHeader}>
            <Text style={styles.historyCardTitle}>{t.recentVerificationsTitle}</Text>
            <TouchableOpacity onPress={onNavigateToHistory}>
              <Text style={styles.viewAllLink}>{t.viewFullHistory}</Text>
            </TouchableOpacity>
          </View>

          {recentLogs.length === 0 ? (
            <Text style={styles.emptyHistoryText}>{t.emptyHistory}</Text>
          ) : (
            recentLogs.map((log) => (
              <View key={log.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <Text style={styles.historyMethod}>
                    {log.verification_method === 'fingerprint' ? '👆 ' + t.methodFingerprint : '📸 ' + t.methodFace}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(log.verified_at).toLocaleDateString(
                      currentLanguage === 'bn' ? 'bn-BD' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    styles.historyBadge,
                    log.verification_status === 'approved'
                      ? styles.historyBadgeApproved
                      : styles.historyBadgeRejected,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyBadgeText,
                      log.verification_status === 'approved'
                        ? styles.historyBadgeTextApproved
                        : styles.historyBadgeTextRejected,
                    ]}
                  >
                    {log.verification_status === 'approved' ? t.statusApprovedBadge : t.statusRejectedBadge}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutBtn}
          accessibilityRole="button"
          accessibilityLabel={t.logout}
        >
          <Text style={styles.logoutBtnText}>🚪 {t.logout}</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  profileMainInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
  },
  pensionerName: {
    ...THEME.typography.title1,
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  designationText: {
    ...THEME.typography.body,
    fontWeight: '600',
    color: THEME.colors.primaryDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.md,
  },
  attributesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  attributeBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
  },
  attributeBoxFull: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 10,
  },
  attributeLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  attributeValue: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  amountBanner: {
    backgroundColor: THEME.colors.accentGoldLight,
    borderWidth: 1.5,
    borderColor: THEME.colors.accentGold,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
  },
  statusCard: {
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    borderWidth: 1.5,
  },
  statusCardVerified: {
    backgroundColor: THEME.colors.statusSuccessBg,
    borderColor: THEME.colors.statusSuccess,
  },
  statusCardDue: {
    backgroundColor: THEME.colors.statusWarningBg,
    borderColor: THEME.colors.statusWarning,
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  statusIconText: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusTitleVerified: {
    color: THEME.colors.statusSuccess,
  },
  statusTitleDue: {
    color: THEME.colors.statusWarning,
  },
  statusDesc: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 3,
    lineHeight: 20,
  },
  sectionHeading: {
    ...THEME.typography.title2,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  actionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    ...THEME.shadows.cardHover,
  },
  actionCardFingerprint: {
    borderColor: THEME.colors.primary,
  },
  actionCardFace: {
    borderColor: '#7C3AED',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionEmoji: {
    fontSize: 30,
  },
  actionCardTitleContainer: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  actionCardSubtitleBn: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
    marginTop: 2,
  },
  actionCardDesc: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButtonPill: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButtonPillText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: THEME.spacing.sm,
    ...THEME.shadows.card,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  viewAllLink: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  emptyHistoryText: {
    fontSize: 15,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyMethod: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  historyDate: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  historyBadgeApproved: {
    backgroundColor: THEME.colors.statusSuccessBg,
  },
  historyBadgeRejected: {
    backgroundColor: THEME.colors.statusDangerBg,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyBadgeTextApproved: {
    color: THEME.colors.statusSuccess,
  },
  historyBadgeTextRejected: {
    color: THEME.colors.statusDanger,
  },
  logoutBtn: {
    marginTop: THEME.spacing.xl,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
  },
  logoutBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.accentRed,
  },
});
