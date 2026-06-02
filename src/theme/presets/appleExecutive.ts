// ─── Apple Executive DNA Preset ──────────────────────────────────────────────
// Clean, spacious, SF-like typography, zero glow, deep elevation.
// Inspired by Apple Keynotes — clarity, confidence, restraint.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const appleExecutive: PartialThemeTokens = {
  colors: {
    background: '#000000',
    surface: '#0a0a0a',
    surfaceSecondary: '#111111',
    cardBackground: '#0f0f0f',
    border: 'rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.04)',
    textPrimary: '#f5f5f7',
    textSecondary: '#86868b',
    textMuted: '#6e6e73',
    accentPrimary: '#0071e3',
    accentSecondary: '#bf5af2',
    success: '#30d158',
    warning: '#ffd60a',
    danger: '#ff453a',
    grid: 'rgba(255,255,255,0.03)',
    tooltipBackground: 'rgba(28,28,30,0.95)',
    tooltipBorder: 'rgba(255,255,255,0.08)',
    chartPalette: ['#0071e3', '#bf5af2', '#30d158', '#ff9f0a', '#ff375f', '#5e5ce6', '#64d2ff', '#ac8e68'],
  },

  typography: {
    headingFont: '"Inter Tight", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: '"Inter Tight", sans-serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"DM Sans", sans-serif',
    titleSize: '1.25rem',
    bodySize: '0.9375rem',
    captionSize: '0.8125rem',
    fontWeightHeading: 600,
    fontWeightBody: 400,
    fontScale: 1.1,
    headingTransform: 'none',
    headingLetterSpacing: '-0.022em',
    metadataTransform: 'uppercase',
  },

  spacing: {
    pagePadding: 'clamp(3rem, 7vw, 8rem)',
    sectionGap: 'clamp(3rem, 6vw, 6rem)',
    cardPadding: '2rem',
    gridGap: 'clamp(1.5rem, 3vw, 3rem)',
  },

  layout: {
    densityLevel: 'airy',
    whitespaceScale: 1.5,
    preferredHeroCount: 1,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1440px',
  },

  cardStyle: {
    borderRadius: '16px',
    borderWidth: '0px',
    shadow: '0 20px 50px -15px rgba(0,0,0,0.5)',
    hoverEffect: '0 30px 60px -15px rgba(0,0,0,0.6)',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'deep',
    borderStyle: 'none',
    innerGlow: false,
    surfaceTexture: 'clean',
  },

  chartStyle: {
    gridOpacity: 0.025,
    lineThickness: 2.5,
    axisThickness: 0,
    barRadius: 6,
    tooltipBlur: '12px',
    chartAccents: { bar: '#0071e3', pie: '#bf5af2', line: '#30d158' },
    axisVisible: false,
    gridlineStyle: 'dashed',
    tooltipStyle: 'solid',
    legendPlacement: 'bottom',
    gradientIntensity: 0.4,
    dotStyle: 'circle',
    areaOpacity: 0.15,
    animationDuration: 1200,
  },

  motion: {
    transitionSpeed: '350ms',
    hoverScale: 1.01,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    hoverBehavior: 'lift',
    sectionEntrance: 'fade',
    staggerDelay: 100,
    springStiffness: 140,
    springDamping: 26,
  },

  meta: {
    themeName: 'Apple Executive',
    mood: ['clean', 'spacious', 'premium', 'minimal'],
    appearance: 'dark',
  },
};
