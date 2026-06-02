// ─── Military Command DNA Preset ─────────────────────────────────────────────
// Blocky, uppercase everything, hard borders, CRT green, no softness.
// Inspired by military command centers, radar systems, tactical HUDs.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const militaryCommand: PartialThemeTokens = {
  colors: {
    background: '#050a05',
    surface: '#0a120a',
    surfaceSecondary: '#0f180f',
    cardBackground: '#0a120a',
    border: 'rgba(0,255,65,0.2)',
    divider: 'rgba(0,255,65,0.08)',
    textPrimary: '#00ff41',
    textSecondary: '#009924',
    textMuted: '#006618',
    accentPrimary: '#00ff41',
    accentSecondary: '#33ff77',
    success: '#00ff41',
    warning: '#ffcc00',
    danger: '#ff3333',
    grid: 'rgba(0,255,65,0.08)',
    tooltipBackground: '#0a120a',
    tooltipBorder: 'rgba(0,255,65,0.25)',
    chartPalette: ['#00ff41', '#33ff77', '#ffcc00', '#00ccff', '#ff6633', '#99ff33', '#ff3366', '#66ffcc'],
  },

  typography: {
    headingFont: '"JetBrains Mono", monospace',
    bodyFont: '"IBM Plex Mono", monospace',
    displayFont: '"Archivo Black", sans-serif',
    monoFont: '"JetBrains Mono", monospace',
    metadataFont: '"JetBrains Mono", monospace',
    titleSize: '0.9375rem',
    bodySize: '0.8125rem',
    captionSize: '0.6875rem',
    fontWeightHeading: 700,
    fontWeightBody: 500,
    fontScale: 0.9,
    headingTransform: 'uppercase',
    headingLetterSpacing: '0.1em',
    metadataTransform: 'uppercase',
    headingScale: 1.125,
    paragraphSpacing: '0.75em',
    headingLineHeight: 1.25,
  },

  spacing: {
    pagePadding: 'clamp(1rem, 2.5vw, 2rem)',
    sectionGap: '1rem',
    cardPadding: '1rem',
    gridGap: '0.625rem',
  },

  layout: {
    densityLevel: 'dense',
    whitespaceScale: 0.65,
    preferredHeroCount: 0,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1920px',
  },

  cardStyle: {
    borderRadius: '0px',
    borderWidth: '2px',
    shadow: 'none',
    hoverEffect: 'none',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'flat',
    borderStyle: 'heavy',
    innerGlow: false,
    surfaceTexture: 'noise',
    surfaceMode: 'terminal',
    scanlineEffect: true,
    paperTexture: false,
  },

  chartStyle: {
    gridOpacity: 0.1,
    lineThickness: 2,
    axisThickness: 1,
    barRadius: 0,
    tooltipBlur: '0px',
    chartAccents: { bar: '#00ff41', pie: '#33ff77', line: '#ffcc00' },
    axisVisible: true,
    gridlineStyle: 'solid',
    tooltipStyle: 'bordered',
    legendPlacement: 'inline',
    gradientIntensity: 0.0,
    dotStyle: 'square',
    areaOpacity: 0.08,
    animationDuration: 200,
    glowIntensity: 0.2,
    axisDensity: 'dense',
    labelStyle: 'verbose',
  },

  motion: {
    transitionSpeed: '100ms',
    hoverScale: 1.0,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    hoverBehavior: 'none',
    sectionEntrance: 'fade',
    staggerDelay: 30,
    springStiffness: 300,
    springDamping: 30,
    motionPreset: 'terminal-scan',
  },

  meta: {
    themeName: 'Military Command',
    mood: ['military', 'tactical', 'command', 'phosphor'],
    appearance: 'dark',
  },
};
