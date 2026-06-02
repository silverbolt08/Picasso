// ─── Luxury Fintech DNA Preset ───────────────────────────────────────────────
// Golden accents, generous whitespace, editorial serif, subtle glass, slow motion.
// Inspired by premium wealth management, private banking interfaces.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const luxuryFintech: PartialThemeTokens = {
  colors: {
    background: '#09080c',
    surface: '#110f16',
    surfaceSecondary: '#16141c',
    cardBackground: 'rgba(17,15,22,0.85)',
    border: 'rgba(212,175,96,0.12)',
    divider: 'rgba(212,175,96,0.06)',
    textPrimary: '#f0ebe0',
    textSecondary: '#a09882',
    textMuted: '#6d6558',
    accentPrimary: '#d4af60',
    accentSecondary: '#c89b3c',
    success: '#4ade80',
    warning: '#d4af60',
    danger: '#ef4444',
    grid: 'rgba(212,175,96,0.04)',
    tooltipBackground: 'rgba(9,8,12,0.92)',
    tooltipBorder: 'rgba(212,175,96,0.15)',
    chartPalette: ['#d4af60', '#c89b3c', '#8b7355', '#e8c88a', '#a68a4b', '#d4c090', '#b8960c', '#f0d888'],
  },

  typography: {
    headingFont: '"Playfair Display", serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: '"Cormorant Garofani", serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"DM Sans", sans-serif',
    titleSize: '1.25rem',
    bodySize: '0.9375rem',
    captionSize: '0.8125rem',
    fontWeightHeading: 500,
    fontWeightBody: 300,
    fontScale: 1.15,
    headingTransform: 'none',
    headingLetterSpacing: '-0.015em',
    metadataTransform: 'uppercase',
  },

  spacing: {
    pagePadding: 'clamp(3.5rem, 8vw, 9rem)',
    sectionGap: 'clamp(3rem, 6vw, 7rem)',
    cardPadding: '2.25rem',
    gridGap: 'clamp(1.75rem, 3.5vw, 3.5rem)',
  },

  layout: {
    densityLevel: 'airy',
    whitespaceScale: 1.7,
    preferredHeroCount: 2,
    gridSymmetry: 'asymmetric',
    maxContentWidth: '1440px',
  },

  cardStyle: {
    borderRadius: '24px',
    borderWidth: '1px',
    shadow: '0 24px 48px -16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
    hoverEffect: '0 30px 60px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
    glassmorphism: 0.4,
    backdropBlur: '16px',
    elevationModel: 'deep',
    borderStyle: 'hairline',
    innerGlow: true,
    surfaceTexture: 'clean',
  },

  chartStyle: {
    gridOpacity: 0.03,
    lineThickness: 2,
    axisThickness: 0,
    barRadius: 10,
    tooltipBlur: '16px',
    chartAccents: { bar: '#d4af60', pie: '#c89b3c', line: '#e8c88a' },
    axisVisible: false,
    gridlineStyle: 'dotted',
    tooltipStyle: 'glass',
    legendPlacement: 'bottom',
    gradientIntensity: 0.45,
    dotStyle: 'circle',
    areaOpacity: 0.18,
    animationDuration: 1500,
  },

  motion: {
    transitionSpeed: '400ms',
    hoverScale: 1.01,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hoverBehavior: 'tilt',
    sectionEntrance: 'slide',
    staggerDelay: 120,
    springStiffness: 120,
    springDamping: 28,
  },

  meta: {
    themeName: 'Luxury Fintech',
    mood: ['luxury', 'gold', 'premium', 'wealth'],
    appearance: 'dark',
  },
};
