import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { THEME } from '../constants/theme';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('bn')}
        style={[
          styles.pillOption,
          currentLanguage === 'bn' && styles.pillOptionActive,
        ]}
        accessibilityRole="button"
        accessibilityLabel="বাংলা ভাষা নির্বাচন করুন"
      >
        <Text
          style={[
            styles.pillText,
            currentLanguage === 'bn' && styles.pillTextActive,
          ]}
        >
          বাংলা
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('en')}
        style={[
          styles.pillOption,
          currentLanguage === 'en' && styles.pillOptionActive,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Select English Language"
      >
        <Text
          style={[
            styles.pillText,
            currentLanguage === 'en' && styles.pillTextActive,
          ]}
        >
          ENG
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
  },
  pillOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillOptionActive: {
    backgroundColor: THEME.colors.primary,
    ...THEME.shadows.card,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
