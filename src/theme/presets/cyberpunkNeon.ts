// ─── Cyberpunk Neon DNA Preset ───────────────────────────────────────────────
// Neon glow, glassmorphism, tight spacing, extreme motion, rounded pills.
// Inspired by Cyberpunk / sci-fi interfaces.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const cyberpunkNeon: PartialThemeTokens = {
  colors: {
    background: '#030308',
    surface: 'rgba(10,15,30,0.6)',
    surfaceSecondary: 'rgba(15,20,40,0.5)',
    cardBackground: 'rgba(10,15,35,0.65)',
    border: 'rgba(0,255,255,0.15)',
    divider: 'rgba(0,255,255,0.06)',
    textPrimary: '#e0f7ff',
    textSecondary: '#6ee7ef',
    textMuted: '#3b8c92',
    accentPrimary: '#00ffff',
    accentSecondary: '#ff00ff',
    success: '#00ff88',
    warning: '#ffaa00',
    danger: '#ff0055',
    grid: 'rgba(0,255,255,0.06)',
    tooltipBackground: 'rgba(5,10,25,0.85)',
    tooltipBorder: 'rgba(0,255,255,0.2)',
    chartPalette: ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff0055', '#7b61ff', '#00d4ff', '#ff6b9d'],
  },

  typography: {
    headingFont: '"Space Grotesk", monospace',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: 'Syne, sans-serif',
    monoFont: '"Space Grotesk", monospace',
    metadataFont: '"Space Grotesk", monospace',
    titleSize: '1rem',
    bodySize: '0.8125rem',
    captionSize: '0.6875rem',
    fontWeightHeading: 700,
    fontWeightBody: 400,
    fontScale: 0.95,
    headingTransform: 'uppercase',
    headingLetterSpacing: '0.06em',
    metadataTransform: 'uppercase',
    headingScale: 1.2,
    paragraphSpacing: '1em',
    headingLineHeight: 1.15,
  },

  spacing: {
    pagePadding: 'clamp(1.5rem, 3vw, 3rem)',
    sectionGap: 'clamp(1.25rem, 2.5vw, 2.5rem)',
    cardPadding: '1.25rem',
    gridGap: 'clamp(0.75rem, 1.5vw, 1.5rem)',
  },

  layout: {
    densityLevel: 'compact',
    whitespaceScale: 0.8,
    preferredHeroCount: 1,
    gridSymmetry: 'asymmetric',
    maxContentWidth: '1680px',
  },

  cardStyle: {
    borderRadius: '16px',
    borderWidth: '1px',
    shadow: '0 0 30px rgba(0,255,255,0.15), 0 0 60px rgba(0,255,255,0.05)',
    hoverEffect: '0 0 40px rgba(0,255,255,0.25), 0 0 80px rgba(0,255,255,0.08)',
    glassmorphism: 0.8,
    backdropBlur: '20px',
    elevationModel: 'layered',
    borderStyle: 'hairline',
    innerGlow: true,
    surfaceTexture: 'noise',
    surfaceMode: 'glass',
    scanlineEffect: true,
    paperTexture: false,
  },

  chartStyle: {
    gridOpacity: 0.06,
    lineThickness: 3,
    axisThickness: 0,
    barRadius: 4,
    tooltipBlur: '20px',
    chartAccents: { bar: '#00ffff', pie: '#ff00ff', line: '#00ff88' },
    axisVisible: false,
    gridlineStyle: 'dashed',
    tooltipStyle: 'glass',
    legendPlacement: 'bottom',
    gradientIntensity: 0.85,
    dotStyle: 'diamond',
    areaOpacity: 0.3,
    animationDuration: 800,
    glowIntensity: 0.9,
    axisDensity: 'minimal',
    labelStyle: 'minimal',
  },

  motion: {
    transitionSpeed: '200ms',
    hoverScale: 1.03,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    hoverBehavior: 'glow',
    sectionEntrance: 'stagger',
    staggerDelay: 60,
    springStiffness: 260,
    springDamping: 20,
    motionPreset: 'spring',
  },

  meta: {
    themeName: 'Cyberpunk Neon',
    mood: ['cyberpunk', 'neon', 'futuristic', 'glassmorphism'],
    appearance: 'dark',
  },
};
