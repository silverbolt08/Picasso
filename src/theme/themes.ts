import type { ThemeTokens } from './themeTypes';

export const darkTheme: ThemeTokens = {
  colors: {
    background: '#090b0f',
    surface: '#11141b',
    surfaceSecondary: '#161a22',
    cardBackground: '#11141b',
    border: 'rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.04)',

    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',

    accentPrimary: '#14b8a6', // Teal
    accentSecondary: '#f59e0b', // Amber

    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',

    grid: 'rgba(255,255,255,0.03)',
    tooltipBackground: '#0f172a',
    tooltipBorder: 'rgba(255,255,255,0.08)',

    chartPalette: [
      '#14b8a6',
      '#6366f1',
      '#f59e0b',
      '#ec4899',
      '#10b981',
      '#3b82f6',
      '#8b5cf6',
      '#ef4444',
    ],
  },

  typography: {
    headingFont: '"Inter Tight", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: 'Syne, sans-serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"DM Sans", sans-serif',
    titleSize: '1.125rem',
    bodySize: '0.875rem',
    captionSize: '0.75rem',
    fontWeightHeading: 600,
    fontWeightBody: 400,
    fontScale: 1.0,
    headingTransform: 'none',
    headingLetterSpacing: '-0.01em',
    metadataTransform: 'uppercase',
    headingScale: 1.25,
    paragraphSpacing: '1.5em',
    headingLineHeight: 1.15,
  },

  spacing: {
    pagePadding: 'clamp(2rem, 5vw, 6rem)',
    sectionGap: 'clamp(2rem, 4vw, 4rem)',
    cardPadding: '1.5rem',
    gridGap: 'clamp(1rem, 2.5vw, 2.5rem)',
  },

  layout: {
    densityLevel: 'comfortable',
    whitespaceScale: 1.0,
    preferredHeroCount: 1,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1680px',
  },

  cardStyle: {
    borderRadius: '20px',
    borderWidth: '1px',
    shadow: '0 12px 24px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0px rgba(255, 255, 255, 0.03)',
    hoverEffect: '0 16px 32px -8px rgba(0, 0, 0, 0.4)',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'layered',
    borderStyle: 'hairline',
    innerGlow: true,
    surfaceTexture: 'clean',
    surfaceMode: 'bordered',
    scanlineEffect: false,
    paperTexture: false,
  },

  chartStyle: {
    gridOpacity: 0.03,
    lineThickness: 3,
    axisThickness: 0,
    barRadius: 8,
    tooltipBlur: '12px',
    chartAccents: {
      bar: '#14b8a6',
      pie: '#6366f1',
      line: '#f59e0b',
    },
    axisVisible: false,
    gridlineStyle: 'dashed',
    tooltipStyle: 'glass',
    legendPlacement: 'bottom',
    gradientIntensity: 0.7,
    dotStyle: 'circle',
    areaOpacity: 0.25,
    animationDuration: 1000,
    glowIntensity: 0,
    axisDensity: 'standard',
    labelStyle: 'minimal',
  },

  motion: {
    transitionSpeed: '250ms',
    hoverScale: 1.015,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hoverBehavior: 'tilt',
    sectionEntrance: 'slide',
    staggerDelay: 80,
    springStiffness: 180,
    springDamping: 24,
    motionPreset: 'spring',
  },

  meta: {
    themeName: 'Midnight Executive',
    mood: ['dark', 'executive', 'cinematic'],
    appearance: 'dark',
  },
};

export const lightTheme: ThemeTokens = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    cardBackground: '#ffffff',
    border: 'rgba(15, 23, 42, 0.06)',
    divider: 'rgba(15, 23, 42, 0.04)',

    textPrimary: '#0f172a', // Slate 900 / Charcoal
    textSecondary: '#475569', // Slate 600 / Graphite
    textMuted: '#64748b', // Slate 500

    accentPrimary: '#0f766e',
    accentSecondary: '#d97706',

    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',

    grid: 'rgba(15, 23, 42, 0.04)',
    tooltipBackground: 'rgba(255, 255, 255, 0.92)',
    tooltipBorder: 'rgba(15, 23, 42, 0.06)',

    chartPalette: [
      '#0f766e',
      '#4f46e5',
      '#d97706',
      '#db2777',
      '#059669',
      '#2563eb',
      '#7c3aed',
      '#dc2626',
    ],
  },

  typography: {
    headingFont: '"Inter Tight", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: 'Syne, sans-serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"DM Sans", sans-serif',
    titleSize: '1.125rem',
    bodySize: '0.875rem',
    captionSize: '0.75rem',
    fontWeightHeading: 600,
    fontWeightBody: 400,
    fontScale: 1.0,
    headingTransform: 'none',
    headingLetterSpacing: '-0.01em',
    metadataTransform: 'uppercase',
    headingScale: 1.25,
    paragraphSpacing: '1.75em',
    headingLineHeight: 1.2,
  },

  spacing: {
    pagePadding: 'clamp(2.5rem, 6vw, 7.5rem)',
    sectionGap: 'clamp(2.5rem, 5vw, 5rem)',
    cardPadding: '1.75rem',
    gridGap: 'clamp(1.25rem, 3vw, 3rem)',
  },

  layout: {
    densityLevel: 'comfortable',
    whitespaceScale: 1.15,
    preferredHeroCount: 1,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1680px',
  },

  cardStyle: {
    borderRadius: '20px',
    borderWidth: '1px',
    shadow: '0 2px 10px rgba(15, 23, 42, 0.02), 0 12px 30px -10px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    hoverEffect: '0 4px 16px rgba(15, 23, 42, 0.03), 0 20px 40px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'subtle',
    borderStyle: 'hairline',
    innerGlow: true,
    surfaceTexture: 'clean',
    surfaceMode: 'bordered',
    scanlineEffect: false,
    paperTexture: false,
  },

  chartStyle: {
    gridOpacity: 0.05,
    lineThickness: 3,
    axisThickness: 0,
    barRadius: 8,
    tooltipBlur: '12px',
    chartAccents: {
      bar: '#0f766e',
      pie: '#4f46e5',
      line: '#d97706',
    },
    axisVisible: false,
    gridlineStyle: 'dashed',
    tooltipStyle: 'glass',
    legendPlacement: 'bottom',
    gradientIntensity: 0.5,
    dotStyle: 'circle',
    areaOpacity: 0.12,
    animationDuration: 1000,
    glowIntensity: 0,
    axisDensity: 'standard',
    labelStyle: 'minimal',
  },

  motion: {
    transitionSpeed: '250ms',
    hoverScale: 1.015,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hoverBehavior: 'tilt',
    sectionEntrance: 'slide',
    staggerDelay: 80,
    springStiffness: 180,
    springDamping: 24,
    motionPreset: 'spring',
  },

  meta: {
    themeName: 'Daylight Editorial',
    mood: ['light', 'editorial', 'premium'],
    appearance: 'light',
  },
};
