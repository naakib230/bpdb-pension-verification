import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { Language } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onBackPress?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentLanguage,
  onLanguageChange,
  onBackPress,
  showBack = false,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBack && onBackPress ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back / পিছনে যান"
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.bpdbBadge}>
              <Text style={styles.bpdbBadgeText}>⚡ BPDB</Text>
            </View>
          )}
        </View>

        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: THEME.spacing.md,
    borderBottomLeftRadius: THEME.borderRadius.lg,
    borderBottomRightRadius: THEME.borderRadius.lg,
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: -2,
  },
  bpdbBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bpdbBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginTop: 4,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },
});
