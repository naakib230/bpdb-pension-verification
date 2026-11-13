// Senior-Friendly Accessible Theme Design System for BPDB Mobile Application
export const THEME = {
  colors: {
    // BPDB Official Brand Colors
    primary: '#006A4E',        // Deep Bangladesh Power Green
    primaryDark: '#004835',    // Dark Forest Green
    primaryLight: '#E6F4EA',   // Accessible light green tint
    accentRed: '#D90429',      // High-contrast Bengali Crimson
    accentRedLight: '#FFE3E5',
    accentGold: '#D48806',     // Power Electricity Gold
    accentGoldLight: '#FEF7E6',
    
    // High-Contrast Senior-Accessible Neutrals
    background: '#F8FAFC',     // Clean background
    surface: '#FFFFFF',        // Pure white card surfaces
    surfaceElevated: '#FFFFFF',
    border: '#CBD5E1',         // High visibility border
    borderStrong: '#94A3B8',
    
    // Crisp Senior Typography
    textPrimary: '#0F172A',    // Pitch slate black (WCAG AAA contrast)
    textSecondary: '#334155',  // Readable deep slate
    textMuted: '#64748B',
    textInverse: '#FFFFFF',
    
    // Status Semantic
    statusSuccess: '#15803D',
    statusSuccessBg: '#DCFCE7',
    statusWarning: '#B45309',
    statusWarningBg: '#FEF3C7',
    statusDanger: '#B91C1C',
    statusDangerBg: '#FEE2E2',
    
    // Overlays & Accents
    cameraGuide: '#22C55E',
    cameraOverlay: 'rgba(0, 0, 0, 0.75)',
  },

  // Senior Accessibility: Extra large touch targets & crisp font scaling
  typography: {
    hero: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
    },
    title1: {
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '700' as const,
    },
    title2: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '600' as const,
    },
    bodyLarge: {
      fontSize: 19,
      lineHeight: 28,
      fontWeight: '500' as const,
    },
    body: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500' as const,
    },
    button: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700' as const,
    },
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 44,
  },

  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  // Sizing for Senior Touch Accessibility
  touchTarget: {
    minHeight: 58,
    minWidth: 58,
  },

  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    cardHover: {
      shadowColor: '#006A4E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
