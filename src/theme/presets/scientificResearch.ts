// ─── Scientific Research DNA Preset ──────────────────────────────────────────
// Clinical, monospace data, gridline-heavy charts, minimal decoration, precise.
// Inspired by scientific journals, research consoles, lab dashboards.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';

export const scientificResearch: PartialThemeTokens = {
  colors: {
    background: '#f7f8fa',
    surface: '#ffffff',
    surfaceSecondary: '#eef0f4',
    cardBackground: '#ffffff',
    border: 'rgba(55,65,81,0.12)',
    divider: 'rgba(55,65,81,0.06)',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    accentPrimary: '#2563eb',
    accentSecondary: '#7c3aed',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    grid: 'rgba(55,65,81,0.08)',
    tooltipBackground: 'rgba(255,255,255,0.96)',
    tooltipBorder: 'rgba(55,65,81,0.15)',
    chartPalette: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#ea580c'],
  },

  typography: {
    headingFont: '"Inter Tight", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    displayFont: '"Inter Tight", sans-serif',
    monoFont: '"JetBrains Mono", monospace',
    metadataFont: '"JetBrains Mono", monospace',
    titleSize: '1rem',
    bodySize: '0.875rem',
    captionSize: '0.75rem',
    fontWeightHeading: 600,
    fontWeightBody: 400,
    fontScale: 0.95,
    headingTransform: 'none',
    headingLetterSpacing: '-0.005em',
    metadataTransform: 'uppercase',
  },

  spacing: {
    pagePadding: 'clamp(2rem, 4vw, 4rem)',
    sectionGap: 'clamp(1.5rem, 3vw, 3rem)',
    cardPadding: '1.5rem',
    gridGap: 'clamp(1rem, 2vw, 2rem)',
  },

  layout: {
    densityLevel: 'comfortable',
    whitespaceScale: 1.0,
    preferredHeroCount: 1,
    gridSymmetry: 'symmetric',
    maxContentWidth: '1680px',
  },

  cardStyle: {
    borderRadius: '4px',
    borderWidth: '1px',
    shadow: '0 1px 3px rgba(0,0,0,0.04)',
    hoverEffect: '0 2px 8px rgba(0,0,0,0.06)',
    glassmorphism: 0.0,
    backdropBlur: '0px',
    elevationModel: 'subtle',
    borderStyle: 'solid',
    innerGlow: false,
    surfaceTexture: 'clean',
  },

  chartStyle: {
    gridOpacity: 0.08,
    lineThickness: 2,
    axisThickness: 1,
    barRadius: 2,
    tooltipBlur: '4px',
    chartAccents: { bar: '#2563eb', pie: '#7c3aed', line: '#059669' },
    axisVisible: true,
    gridlineStyle: 'solid',
    tooltipStyle: 'bordered',
    legendPlacement: 'bottom',
    gradientIntensity: 0.15,
    dotStyle: 'circle',
    areaOpacity: 0.08,
    animationDuration: 600,
  },

  motion: {
    transitionSpeed: '200ms',
    hoverScale: 1.005,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    hoverBehavior: 'scale',
    sectionEntrance: 'fade',
    staggerDelay: 50,
    springStiffness: 220,
    springDamping: 28,
  },

  meta: {
    themeName: 'Scientific Research',
    mood: ['clinical', 'precise', 'academic', 'data-driven'],
    appearance: 'light',
  },
};
