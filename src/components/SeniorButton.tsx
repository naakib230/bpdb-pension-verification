import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';

interface SeniorButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'normal' | 'large';
}

export const SeniorButton: React.FC<SeniorButtonProps> = ({
  title,
  subtitle,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  size = 'large',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return THEME.colors.border;
    switch (variant) {
      case 'primary':
        return THEME.colors.primary;
      case 'danger':
        return THEME.colors.accentRed;
      case 'gold':
        return THEME.colors.accentGold;
      case 'secondary':
        return THEME.colors.primaryLight;
      case 'outline':
        return 'transparent';
      default:
        return THEME.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return THEME.colors.textMuted;
    switch (variant) {
      case 'secondary':
        return THEME.colors.primaryDark;
      case 'outline':
        return THEME.colors.primary;
      default:
        return THEME.colors.textInverse;
    }
  };

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        size === 'large' ? styles.largeButton : styles.normalButton,
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outlineBorder,
        disabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || variant === 'secondary' ? THEME.colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={[styles.mainText, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subText,
                  { color: variant === 'secondary' ? THEME.colors.textSecondary : 'rgba(255,255,255,0.85)' },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
    ...THEME.shadows.card,
  },
  largeButton: {
    minHeight: 64,
    paddingVertical: 14,
  },
  normalButton: {
    minHeight: 52,
    paddingVertical: 10,
  },
  outlineBorder: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButton: {
    elevation: 0,
    shadowOpacity: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: THEME.spacing.md,
  },
  textContainer: {
    alignItems: 'center',
  },
  mainText: {
    ...THEME.typography.button,
    textAlign: 'center',
  },
  subText: {
    ...THEME.typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
});
