// ─── Editorial Magazine DNA Preset ───────────────────────────────────────────
// High-contrast, asymmetric emphasis, serif/sans pairing, paper-white.
// Inspired by The Economist, Monocle, premium editorial dashboards.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const editorialMagazine: PartialThemeTokens = {
  colors: {
    background: '#faf9f6',
    surface: '#ffffff',
    surfaceSecondary: '#f3f1ec',
    cardBackground: '#ffffff',
    border: 'rgba(30,28,24,0.08)',
    divider: 'rgba(30,28,24,0.05)',
    textPrimary: '#1a1816',
    textSecondary: '#555048',
    textMuted: '#8a847a',
    accentPrimary: '#c0392b',
    accentSecondary: '#2c3e50',
    success: '#27ae60',
    warning: '#e67e22',
    danger: '#c0392b',
    grid: 'rgba(30,28,24,0.05)',
    tooltipBackground: 'rgba(255,255,255,0.96)',
    tooltipBorder: 'rgba(30,28,24,0.1)',
    chartPalette: ['#c0392b', '#2c3e50', '#27ae60', '#e67e22', '#8e44ad', '#2980b9', '#16a085', '#d35400'],
  },

  typography: {
    headingFont: '"Playfair Display", serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: '"Cormorant Garofani", serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"DM Sans", sans-serif',
    titleSize: '1.375rem',
    bodySize: '0.9375rem',
    captionSize: '0.8125rem',
    fontWeightHeading: 700,
    fontWeightBody: 400,
    fontScale: 1.1,
    headingTransform: 'none',
    headingLetterSpacing: '-0.02em',
    metadataTransform: 'uppercase',
  },

  spacing: {
    pagePadding: 'clamp(3rem, 6vw, 8rem)',
    sectionGap: 'clamp(2.5rem, 5vw, 5rem)',
    cardPadding: '2rem',
    gridGap: 'clamp(1.5rem, 3vw, 3rem)',
  },

  layout: {
    densityLevel: 'comfortable',
    whitespaceScale: 1.3,
    preferredHeroCount: 1,
    gridSymmetry: 'asymmetric',
    maxContentWidth: '1440px',
  },

  cardStyle: {
    borderRadius: '8px',
    borderWidth: '1px',
    shadow: '0 1px 4px rgba(0,0,0,0.02), 0 8px 24px -8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    hoverEffect: '0 2px 8px rgba(0,0,0,0.03), 0 12px 32px -8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'subtle',
    borderStyle: 'hairline',
    innerGlow: false,
    surfaceTexture: 'clean',
  },

  chartStyle: {
    gridOpacity: 0.04,
    lineThickness: 2.5,
    axisThickness: 1,
    barRadius: 4,
    tooltipBlur: '8px',
    chartAccents: { bar: '#c0392b', pie: '#2c3e50', line: '#27ae60' },
    axisVisible: true,
    gridlineStyle: 'dotted',
    tooltipStyle: 'solid',
    legendPlacement: 'right',
    gradientIntensity: 0.3,
    dotStyle: 'circle',
    areaOpacity: 0.1,
    animationDuration: 1000,
  },

  motion: {
    transitionSpeed: '300ms',
    hoverScale: 1.01,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    hoverBehavior: 'lift',
    sectionEntrance: 'fade',
    staggerDelay: 90,
    springStiffness: 160,
    springDamping: 26,
  },

  meta: {
    themeName: 'Editorial Magazine',
    mood: ['editorial', 'print', 'high-contrast', 'refined'],
    appearance: 'light',
  },
};
