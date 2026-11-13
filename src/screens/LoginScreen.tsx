import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, Pensioner } from '../types';
import { SeniorButton } from '../components/SeniorButton';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (pensioner: Pensioner) => void;
}

const DEMO_PENSIONERS: Pensioner[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    pension_id: 'BPDB-100452',
    nid_number: '19582691234567890',
    full_name_en: 'Md. Rafiqul Islam',
    full_name_bn: 'মোঃ রফিকুল ইসলাম',
    designation_en: 'Senior Sub-Assistant Engineer',
    designation_bn: 'সিনিয়র উপ-সহকারী প্রকৌশলী',
    department_en: 'Distribution Division - Chattogram',
    department_bn: 'বিতরণ বিভাগ - চট্টগ্রাম',
    retirement_date: '2018-06-30',
    monthly_pension_amount: 42850.0,
    phone_number: '+8801711234567',
    reference_photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    biometric_enrolled: false,
    pension_status: 'due',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    pension_id: 'BPDB-200873',
    nid_number: '19612699876543210',
    full_name_en: 'Begum Rokeya Sultana',
    full_name_bn: 'বেগম রোকেয়া সুলতানা',
    designation_en: 'Senior Accounts Officer',
    designation_bn: 'সিনিয়র হিসাবরক্ষণ কর্মকর্তা',
    department_en: 'Finance & Revenue - Dhaka HQ',
    department_bn: 'অর্থ ও রাজস্ব উইং - ঢাকা সদর দপ্তর',
    retirement_date: '2021-03-31',
    monthly_pension_amount: 49300.0,
    phone_number: '+8801819876543',
    reference_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    biometric_enrolled: true,
    pension_status: 'verified',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoginSuccess,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [pensionId, setPensionId] = useState('BPDB-100452');
  const [nidNumber, setNidNumber] = useState('19582691234567890');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!pensionId.trim() || !nidNumber.trim()) {
      Alert.alert(t.error, t.loginErrorEmpty);
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt query from Supabase database
      const { data, error } = await supabase
        .from('pensioners')
        .select('*')
        .eq('pension_id', pensionId.trim())
        .eq('nid_number', nidNumber.trim())
        .maybeSingle();

      if (data && !error) {
        onLoginSuccess(data as Pensioner);
        return;
      }

      // 2. Fallback to bundled demo pensioner profile for seamless offline/demo test
      const foundDemo = DEMO_PENSIONERS.find(
        (p) =>
          p.pension_id.toLowerCase() === pensionId.trim().toLowerCase() &&
          p.nid_number === nidNumber.trim()
      );

      if (foundDemo) {
        onLoginSuccess(foundDemo);
        return;
      }

      Alert.alert(t.error, t.loginErrorNotFound);
    } catch (err: any) {
      console.warn('Login lookup exception:', err);
      // Fallback
      const foundDemo = DEMO_PENSIONERS.find(
        (p) => p.pension_id.toLowerCase() === pensionId.trim().toLowerCase()
      );
      if (foundDemo) {
        onLoginSuccess(foundDemo);
      } else {
        Alert.alert(t.error, t.loginErrorNotFound);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demo: Pensioner) => {
    setPensionId(demo.pension_id);
    setNidNumber(demo.nid_number);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Header
        title={t.appTitle}
        subtitle={t.govtTag}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>{t.loginTitle}</Text>
          <Text style={styles.subheading}>{t.loginSubtitle}</Text>

          {/* Pension ID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.pensionIdLabel}</Text>
            <TextInput
              value={pensionId}
              onChangeText={setPensionId}
              placeholder={t.pensionIdPlaceholder}
              placeholderTextColor={THEME.colors.textMuted}
              style={styles.textInput}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel={t.pensionIdLabel}
            />
          </View>

          {/* NID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.nidLabel}</Text>
            <TextInput
              value={nidNumber}
              onChangeText={setNidNumber}
              placeholder={t.nidPlaceholder}
              placeholderTextColor={THEME.colors.textMuted}
              style={styles.textInput}
              keyboardType="number-pad"
              autoCorrect={false}
              accessibilityLabel={t.nidLabel}
            />
          </View>

          {/* Submit Button */}
          <SeniorButton
            title={t.loginButton}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />
        </View>

        {/* Quick-Fill Demonstration Profiles */}
        <View style={styles.demoSection}>
          <Text style={styles.demoHeader}>{t.quickFillTitle}</Text>
          {DEMO_PENSIONERS.map((demo) => {
            const isSelected = pensionId === demo.pension_id;
            return (
              <TouchableOpacity
                key={demo.pension_id}
                onPress={() => handleSelectDemo(demo)}
                style={[
                  styles.demoItem,
                  isSelected && styles.demoItemSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select demo profile ${demo.full_name_en}`}
              >
                <View style={styles.demoInfo}>
                  <Text style={styles.demoName}>
                    {currentLanguage === 'bn' ? demo.full_name_bn : demo.full_name_en}
                  </Text>
                  <Text style={styles.demoSub}>
                    ID: {demo.pension_id} • NID: {demo.nid_number}
                  </Text>
                  <Text style={styles.demoStatus}>
                    Status:{' '}
                    {demo.pension_status === 'verified'
                      ? t.statusVerified
                      : t.statusDue}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  heading: {
    ...THEME.typography.title1,
    color: THEME.colors.primaryDark,
    marginBottom: 6,
  },
  subheading: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.lg,
  },
  inputGroup: {
    marginBottom: THEME.spacing.lg,
  },
  inputLabel: {
    ...THEME.typography.bodyLarge,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: THEME.colors.borderStrong,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 14,
    fontSize: 20,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: THEME.spacing.sm,
  },
  demoSection: {
    marginTop: THEME.spacing.xl,
  },
  demoHeader: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoItem: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  demoItemSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  demoSub: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  demoStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.statusSuccess,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.colors.borderStrong,
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
});
