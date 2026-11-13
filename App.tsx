import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from './src/constants/theme';
import { Language, Pensioner, VerificationReceipt } from './src/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { FingerprintVerificationScreen } from './src/screens/FingerprintVerificationScreen';
import { FaceVerificationScreen } from './src/screens/FaceVerificationScreen';
import { VerificationResultScreen } from './src/screens/VerificationResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

type AppScreen = 'login' | 'dashboard' | 'fingerprint' | 'face' | 'result' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  // Default to Bengali ('bn') for BPDB senior pensioners, toggleable anytime
  const [language, setLanguage] = useState<Language>('bn');
  const [pensioner, setPensioner] = useState<Pensioner | null>(null);
  const [latestReceipt, setLatestReceipt] = useState<VerificationReceipt | null>(null);

  const handleLoginSuccess = (user: Pensioner) => {
    setPensioner(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setPensioner(null);
    setLatestReceipt(null);
    setCurrentScreen('login');
  };

  const handleVerificationSuccess = (receipt: VerificationReceipt) => {
    setLatestReceipt(receipt);
    // Update local pensioner state
    if (pensioner) {
      setPensioner({
        ...pensioner,
        pension_status: 'verified',
        last_verified_at: receipt.verified_at,
        last_verified_method: receipt.method,
      });
    }
    setCurrentScreen('result');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={THEME.colors.primaryDark} />

        {currentScreen === 'login' && (
          <LoginScreen
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'dashboard' && pensioner && (
          <DashboardScreen
            pensioner={pensioner}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onNavigateToFingerprint={() => setCurrentScreen('fingerprint')}
            onNavigateToFace={() => setCurrentScreen('face')}
            onNavigateToHistory={() => setCurrentScreen('history')}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'fingerprint' && pensioner && (
          <FingerprintVerificationScreen
            pensioner={pensioner}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onBackPress={() => setCurrentScreen('dashboard')}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}

        {currentScreen === 'face' && pensioner && (
          <FaceVerificationScreen
            pensioner={pensioner}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onBackPress={() => setCurrentScreen('dashboard')}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}

        {currentScreen === 'result' && latestReceipt && (
          <VerificationResultScreen
            receipt={latestReceipt}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onReturnToDashboard={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'history' && pensioner && (
          <HistoryScreen
            pensioner={pensioner}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onBackPress={() => setCurrentScreen('dashboard')}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
  },
});
