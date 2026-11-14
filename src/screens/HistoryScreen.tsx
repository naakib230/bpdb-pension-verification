import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, Pensioner, VerificationLog } from '../types';
import { Header } from '../components/Header';
import { getVerificationHistory } from '../services/historyService';

interface HistoryScreenProps {
  pensioner: Pensioner;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onBackPress: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  pensioner,
  currentLanguage,
  onLanguageChange,
  onBackPress,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await getVerificationHistory(pensioner.pension_id);
      setLogs(data);
    } catch (err) {
      console.warn('Fetch logs error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pensioner.pension_id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t.historyTitle}
        subtitle={t.historySubtitle}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        showBack={true}
        onBackPress={onBackPress}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
          }
        >
          {logs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t.emptyHistory}</Text>
            </View>
          ) : (
            logs.map((log) => {
              const isApproved = log.verification_status === 'approved';
              const formattedDate = new Date(log.verified_at).toLocaleDateString(
                currentLanguage === 'bn' ? 'bn-BD' : 'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logHeaderRow}>
                    <Text style={styles.logMethod}>
                      {log.verification_method === 'fingerprint'
                        ? '👆 ' + t.methodFingerprint
                        : '📸 ' + t.methodFace}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        isApproved ? styles.badgeApproved : styles.badgeRejected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          isApproved ? styles.badgeTextApproved : styles.badgeTextRejected,
                        ]}
                      >
                        {isApproved ? t.statusApprovedBadge : t.statusRejectedBadge}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.logBody}>
                    <Text style={styles.logDate}>📅 {formattedDate}</Text>
                    <Text style={styles.logScore}>
                      🎯 {currentLanguage === 'bn' ? 'নির্ভুলতার স্কোর: ' : 'Confidence Score: '}
                      {(log.confidence_score * 100).toFixed(1)}%
                    </Text>
                    {log.location_address && (
                      <Text style={styles.logLocation}>
                        📍 {log.location_address}
                      </Text>
                    )}
                    {log.failure_reason && (
                      <Text style={styles.logError}>
                        ⚠️ {log.failure_reason}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 48,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyText: {
    ...THEME.typography.bodyLarge,
    color: THEME.colors.textMuted,
  },
  logCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logMethod: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  badgeApproved: {
    backgroundColor: THEME.colors.statusSuccessBg,
    borderWidth: 1,
    borderColor: THEME.colors.statusSuccess,
  },
  badgeRejected: {
    backgroundColor: THEME.colors.statusDangerBg,
    borderWidth: 1,
    borderColor: THEME.colors.statusDanger,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  badgeTextApproved: {
    color: THEME.colors.statusSuccess,
  },
  badgeTextRejected: {
    color: THEME.colors.statusDanger,
  },
  logBody: {
    marginTop: 4,
    gap: 6,
  },
  logDate: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  logScore: {
    fontSize: 16,
    color: THEME.colors.primaryDark,
    fontWeight: '700',
  },
  logLocation: {
    fontSize: 14,
    color: THEME.colors.textMuted,
  },
  logError: {
    fontSize: 14,
    color: THEME.colors.accentRed,
    marginTop: 4,
    fontWeight: '600',
  },
});
