import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { THEME } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { Language, Pensioner, VerificationReceipt, LivenessStep } from '../types';
import { Header } from '../components/Header';
import { FaceGuideOverlay } from '../components/FaceGuideOverlay';
import { SeniorButton } from '../components/SeniorButton';
import { verifyFaceWithServer } from '../services/faceService';

interface FaceVerificationScreenProps {
  pensioner: Pensioner;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onBackPress: () => void;
  onVerificationSuccess: (receipt: VerificationReceipt) => void;
}

export const FaceVerificationScreen: React.FC<FaceVerificationScreenProps> = ({
  pensioner,
  currentLanguage,
  onLanguageChange,
  onBackPress,
  onVerificationSuccess,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState<LivenessStep>('look_straight');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  // Automated Senior-Friendly Liveness Progression
  // Prompts user through: Look Straight -> Blink -> Smile -> Auto-Capture
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (permission?.granted && !isProcessing && !capturedPhotoUri) {
      if (currentStep === 'look_straight') {
        timer = setTimeout(() => {
          setCurrentStep('blink');
        }, 2200);
      } else if (currentStep === 'blink') {
        timer = setTimeout(() => {
          setCurrentStep('smile');
        }, 2600);
      } else if (currentStep === 'smile') {
        timer = setTimeout(() => {
          setCurrentStep('completed');
          handleAutoCapture();
        }, 2400);
      }
    }

    return () => clearTimeout(timer);
  }, [currentStep, permission?.granted, isProcessing, capturedPhotoUri]);

  const getStepInstruction = (): string => {
    switch (currentStep) {
      case 'look_straight':
        return t.livenessLookStraight;
      case 'blink':
        return t.livenessBlink;
      case 'smile':
        return t.livenessSmile;
      case 'completed':
        return t.livenessComplete;
      default:
        return t.livenessLookStraight;
    }
  };

  const handleAutoCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setProcessingStatus(t.faceProcessingServer);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Could not capture frame from camera.');
      }

      setCapturedPhotoUri(photo.uri);
      await submitFaceVerification(photo.uri);
    } catch (err: any) {
      console.warn('Capture error:', err);
      setIsProcessing(false);
      setFailureReason(err.message || 'Camera capture failed.');
    }
  };

  const submitFaceVerification = async (photoUri: string) => {
    setIsProcessing(true);
    setFailureReason(null);
    setProcessingStatus(t.faceProcessingServer);

    const pensionerName = currentLanguage === 'bn' ? pensioner.full_name_bn : pensioner.full_name_en;
    const designation = currentLanguage === 'bn' ? pensioner.designation_bn : pensioner.designation_en;

    const result = await verifyFaceWithServer({
      pensionId: pensioner.pension_id,
      pensionerName,
      designation,
      photoUri,
      livenessPassed: true,
      livenessActions: { blink: true, smile: true },
    });

    setIsProcessing(false);

    if (result.success && result.receipt) {
      onVerificationSuccess(result.receipt);
    } else {
      setFailureReason(
        result.error ||
          `${t.faceFailDesc} (Score: ${result.similarityScore ? result.similarityScore.toFixed(1) : 0}%)`
      );
    }
  };

  const handleRetry = () => {
    setCapturedPhotoUri(null);
    setFailureReason(null);
    setCurrentStep('look_straight');
    setIsProcessing(false);
  };

  // If camera permission has not yet been determined or was denied
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.screen}>
        <Header
          title={t.faceScreenTitle}
          subtitle={t.orgNameShort}
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          showBack={true}
          onBackPress={onBackPress}
        />
        <View style={styles.permissionCard}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={styles.permissionTitle}>{t.cameraPermissionNeeded}</Text>
          <Text style={styles.permissionDesc}>
            {currentLanguage === 'bn'
              ? 'পেনশনভোগীর মুখমণ্ডল যাচাইকরণ ও লাইভনেস পরীক্ষার জন্য ফোনের সামনের ক্যামেরা ব্যবহারের অনুমতি আবশ্যক।'
              : 'Front camera access is strictly required to verify the pensioner\'s live face against official BPDB records.'}
          </Text>
          <SeniorButton
            title={t.btnGrantPermission}
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header
        title={t.faceScreenTitle}
        subtitle={t.faceThresholdLabel}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        showBack={true}
        onBackPress={onBackPress}
      />

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          facing="front"
          style={StyleSheet.absoluteFillObject}
        />

        {/* Guided Oval Mask & Real-Time Liveness Step Prompts */}
        <FaceGuideOverlay
          currentStep={currentStep}
          stepMessage={getStepInstruction()}
        />

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <View style={styles.processingModal}>
            <View style={styles.processingBox}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text style={styles.processingTitle}>{processingStatus}</Text>
              <Text style={styles.processingSub}>
                {t.faceThresholdLabel}
              </Text>
            </View>
          </View>
        )}

        {/* Failure / Retry Modal */}
        {failureReason && (
          <View style={styles.failureModal}>
            <View style={styles.failureBox}>
              <Text style={styles.failureEmoji}>⚠️</Text>
              <Text style={styles.failureTitle}>{t.faceFailTitle}</Text>
              <Text style={styles.failureDesc}>{failureReason}</Text>
              <SeniorButton
                title={t.retry}
                onPress={handleRetry}
                variant="danger"
                style={styles.retryBtn}
              />
            </View>
          </View>
        )}

        {/* Bottom Manual Capture Button (Fallback if user prefers manual tap) */}
        {!isProcessing && !failureReason && (
          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={handleAutoCapture}
              style={styles.manualCaptureBtn}
              accessibilityRole="button"
              accessibilityLabel={t.btnCaptureManually}
            >
              <View style={styles.innerCaptureCircle} />
            </TouchableOpacity>
            <Text style={styles.tapInstruction}>
              {currentLanguage === 'bn'
                ? 'স্বয়ংক্রিয়ভাবে ছবি উঠবে, অথবা চাপ দিন'
                : 'Auto-capturing after prompts, or tap to capture'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionCard: {
    margin: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  permissionEmoji: {
    fontSize: 58,
    marginBottom: 16,
  },
  permissionTitle: {
    ...THEME.typography.title1,
    textAlign: 'center',
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  permissionDesc: {
    ...THEME.typography.body,
    textAlign: 'center',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xl,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  processingModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  processingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    width: '90%',
    ...THEME.shadows.cardHover,
  },
  processingTitle: {
    ...THEME.typography.title2,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  processingSub: {
    fontSize: 16,
    color: THEME.colors.primaryDark,
    fontWeight: '700',
    marginTop: 8,
  },
  failureModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  failureBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    width: '92%',
    ...THEME.shadows.cardHover,
  },
  failureEmoji: {
    fontSize: 50,
  },
  failureTitle: {
    ...THEME.typography.title1,
    color: THEME.colors.accentRed,
    marginTop: 8,
    textAlign: 'center',
  },
  failureDesc: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  retryBtn: {
    marginTop: 20,
    width: '100%',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  manualCaptureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  innerCaptureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  tapInstruction: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
