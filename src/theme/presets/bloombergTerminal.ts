// ─── Bloomberg Terminal DNA Preset ───────────────────────────────────────────
// Ultra-dense, monospace everything, sharp corners, no animation, bright data.
// Inspired by Bloomberg Terminal — information density above all else.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const bloombergTerminal: PartialThemeTokens = {
  colors: {
    background: '#0a0a0a',
    surface: '#111111',
    surfaceSecondary: '#181818',
    cardBackground: '#111111',
    border: 'rgba(255,255,255,0.15)',
    divider: 'rgba(255,255,255,0.08)',
    textPrimary: '#ff8c00',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    accentPrimary: '#ff8c00',
    accentSecondary: '#00d4aa',
    success: '#00d4aa',
    warning: '#ff8c00',
    danger: '#ff3b3b',
    grid: 'rgba(255,255,255,0.08)',
    tooltipBackground: '#1a1a1a',
    tooltipBorder: 'rgba(255,255,255,0.2)',
    chartPalette: ['#ff8c00', '#00d4aa', '#4d88ff', '#ff5555', '#ffd700', '#00bfff', '#ff69b4', '#7fff00'],
  },

  typography: {
    headingFont: '"JetBrains Mono", monospace',
    bodyFont: '"IBM Plex Mono", monospace',
    displayFont: '"JetBrains Mono", monospace',
    monoFont: '"JetBrains Mono", monospace',
    metadataFont: '"JetBrains Mono", monospace',
    titleSize: '0.875rem',
    bodySize: '0.75rem',
    captionSize: '0.6875rem',
    fontWeightHeading: 700,
    fontWeightBody: 400,
    fontScale: 0.85,
    headingTransform: 'uppercase',
    headingLetterSpacing: '0.08em',
    metadataTransform: 'uppercase',
  },

  spacing: {
    pagePadding: '1rem',
    sectionGap: '0.75rem',
    cardPadding: '0.75rem',
    gridGap: '0.5rem',
  },

  layout: {
    densityLevel: 'dense',
    whitespaceScale: 0.6,
    preferredHeroCount: 0,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1920px',
  },

  cardStyle: {
    borderRadius: '0px',
    borderWidth: '1px',
    shadow: 'none',
    hoverEffect: 'none',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'flat',
    borderStyle: 'solid',
    innerGlow: false,
    surfaceTexture: 'clean',
  },

  chartStyle: {
    gridOpacity: 0.1,
    lineThickness: 2,
    axisThickness: 1,
    barRadius: 0,
    tooltipBlur: '0px',
    chartAccents: { bar: '#ff8c00', pie: '#00d4aa', line: '#4d88ff' },
    axisVisible: true,
    gridlineStyle: 'solid',
    tooltipStyle: 'bordered',
    legendPlacement: 'inline',
    gradientIntensity: 0.0,
    dotStyle: 'square',
    areaOpacity: 0.05,
    animationDuration: 0,
  },

  motion: {
    transitionSpeed: '0ms',
    hoverScale: 1.0,
    easing: 'linear',
    hoverBehavior: 'none',
    sectionEntrance: 'none',
    staggerDelay: 0,
    springStiffness: 300,
    springDamping: 30,
  },

  meta: {
    themeName: 'Bloomberg Terminal',
    mood: ['dense', 'professional', 'data-heavy', 'monospace'],
    appearance: 'dark',
  },
};
