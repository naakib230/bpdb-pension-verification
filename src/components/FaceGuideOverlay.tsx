import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Mask, Rect, Ellipse } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { LivenessStep } from '../types';

interface FaceGuideOverlayProps {
  currentStep: LivenessStep;
  stepMessage: string;
  isAligned?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OVAL_WIDTH = SCREEN_WIDTH * 0.72;
const OVAL_HEIGHT = SCREEN_HEIGHT * 0.44;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT * 0.42;

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({
  currentStep,
  stepMessage,
  isAligned = true,
}) => {
  const getBorderColor = () => {
    switch (currentStep) {
      case 'completed':
        return '#22C55E'; // Success green
      case 'smile':
      case 'blink':
        return '#38BDF8'; // Active bright cyan
      default:
        return '#FACC15'; // Attention yellow
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* SVG Mask: Cut out the Oval from the semi-transparent black overlay */}
      <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Mask id="mask" x="0" y="0" height={SCREEN_HEIGHT} width={SCREEN_WIDTH}>
            <Rect x="0" y="0" height={SCREEN_HEIGHT} width={SCREEN_WIDTH} fill="#FFFFFF" />
            <Ellipse
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={OVAL_WIDTH / 2}
              ry={OVAL_HEIGHT / 2}
              fill="#000000"
            />
          </Mask>
        </Defs>
        <Rect
          x="0"
          y="0"
          height={SCREEN_HEIGHT}
          width={SCREEN_WIDTH}
          fill="rgba(0, 0, 0, 0.70)"
          mask="url(#mask)"
        />
      </Svg>

      {/* Styled Oval Border */}
      <View
        style={[
          styles.ovalBorder,
          {
            width: OVAL_WIDTH,
            height: OVAL_HEIGHT,
            top: CENTER_Y - OVAL_HEIGHT / 2,
            left: CENTER_X - OVAL_WIDTH / 2,
            borderColor: getBorderColor(),
          },
        ]}
      />

      {/* Top Banner: Real-time Liveness Step Instruction */}
      <View style={styles.promptContainer}>
        <View
          style={[
            styles.promptBadge,
            { borderColor: getBorderColor() },
          ]}
        >
          <Text style={styles.promptText}>{stepMessage}</Text>
        </View>

        {/* Step Progress Indicators */}
        <View style={styles.stepDotsRow}>
          <View
            style={[
              styles.stepDot,
              currentStep === 'look_straight' && styles.stepDotActive,
              (currentStep === 'blink' || currentStep === 'smile' || currentStep === 'completed') &&
                styles.stepDotPassed,
            ]}
          />
          <View
            style={[
              styles.stepDot,
              currentStep === 'blink' && styles.stepDotActive,
              (currentStep === 'smile' || currentStep === 'completed') && styles.stepDotPassed,
            ]}
          />
          <View
            style={[
              styles.stepDot,
              currentStep === 'smile' && styles.stepDotActive,
              currentStep === 'completed' && styles.stepDotPassed,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ovalBorder: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: 'dashed',
  },
  promptContainer: {
    position: 'absolute',
    top: 54,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
    alignItems: 'center',
  },
  promptBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    width: '100%',
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepDotsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  stepDotActive: {
    backgroundColor: '#FACC15',
    transform: [{ scale: 1.25 }],
  },
  stepDotPassed: {
    backgroundColor: '#22C55E',
  },
});
