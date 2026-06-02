import type { ThemeTokens } from '../../theme/themeTypes';

// ─── Static Fallback Scale ───────────────────────────────────────────────────
// Used when theme context is not available (e.g., outside ThemeProvider).
// This matches the default dark theme values.

const DEFAULT_FONTS = {
  display: 'Syne, sans-serif',
  heading: '"Inter Tight", sans-serif',
  body: '"DM Sans", sans-serif',
  mono: '"Space Grotesk", monospace',
};

const DEFAULT_TRACKING = {
  tightest: '-0.04em',
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
  widest: '0.1em',
};

export const typeScale = {
  display: {
    fontFamily: DEFAULT_FONTS.display,
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: DEFAULT_TRACKING.tightest,
  },
  hero: {
    fontFamily: DEFAULT_FONTS.heading,
    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: DEFAULT_TRACKING.tighter,
  },
  heading: {
    fontFamily: DEFAULT_FONTS.heading,
    fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: DEFAULT_TRACKING.tight,
  },
  subheading: {
    fontFamily: DEFAULT_FONTS.heading,
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: DEFAULT_TRACKING.tight,
  },
  body: {
    fontFamily: DEFAULT_FONTS.body,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: DEFAULT_TRACKING.normal,
  },
  metadata: {
    fontFamily: DEFAULT_FONTS.body,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: DEFAULT_TRACKING.wide,
  },
  chartLabel: {
    fontFamily: DEFAULT_FONTS.mono,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: DEFAULT_TRACKING.normal,
  },
  micro: {
    fontFamily: DEFAULT_FONTS.body,
    fontSize: '0.625rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: DEFAULT_TRACKING.widest,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Returns a React style object matching a specific scale key.
 * Uses the static fallback type scale.
 */
export function getTextStyle(scaleKey: keyof typeof typeScale) {
  const scale = typeScale[scaleKey];
  return {
    fontFamily: scale.fontFamily,
    fontSize: scale.fontSize,
    fontWeight: scale.fontWeight,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    ...('textTransform' in scale ? { textTransform: scale.textTransform } : {}),
  };
}

// ─── Dynamic Type Scale Builder ──────────────────────────────────────────────
// Builds a type scale from the current theme's Typography DNA.
// This is the primary function rendering components should use.

export type TypeScaleKey = 'display' | 'hero' | 'heading' | 'subheading' | 'body' | 'metadata' | 'chartLabel' | 'micro';

export interface TypeScaleEntry {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: 'uppercase' | 'none' | 'small-caps';
}

export function buildTypeScale(theme: ThemeTokens): Record<TypeScaleKey, TypeScaleEntry> {
  const t = theme.typography;
  const scale = t.fontScale ?? 1;
  const headingRatio = t.headingScale ?? 1.25;
  const hLineHeight = t.headingLineHeight ?? 1.15;

  // Apply font scale to base sizes
  const scaleSize = (base: string): string => {
    // Handle clamp() — scale the middle value
    if (base.startsWith('clamp(')) return base;
    // Handle rem/em
    const match = base.match(/^([\d.]+)(rem|em|px)$/);
    if (match) {
      const val = parseFloat(match[1]) * scale;
      return `${val.toFixed(4)}${match[2]}`;
    }
    return base;
  };

  // Modular scale: compute heading sizes from body base using headingScale ratio
  const bodyBase = parseFloat(t.bodySize ?? '0.875') || 0.875;
  const modularSize = (power: number): string => {
    const val = bodyBase * Math.pow(headingRatio, power) * scale;
    return `${val.toFixed(4)}rem`;
  };

  const headingTransform = t.headingTransform ?? 'none';
  const metadataTransform = t.metadataTransform ?? 'uppercase';

  return {
    display: {
      fontFamily: t.displayFont ?? t.headingFont,
      fontSize: scaleSize('clamp(2.5rem, 6vw, 4.5rem)'),
      fontWeight: t.fontWeightHeading + 200,
      lineHeight: Math.max(1.0, hLineHeight - 0.1),
      letterSpacing: t.headingLetterSpacing ?? '-0.04em',
      textTransform: headingTransform,
    },
    hero: {
      fontFamily: t.headingFont,
      fontSize: modularSize(4),
      fontWeight: t.fontWeightHeading + 100,
      lineHeight: hLineHeight,
      letterSpacing: t.headingLetterSpacing ?? '-0.02em',
      textTransform: headingTransform,
    },
    heading: {
      fontFamily: t.headingFont,
      fontSize: modularSize(3),
      fontWeight: t.fontWeightHeading,
      lineHeight: hLineHeight,
      letterSpacing: t.headingLetterSpacing ?? '-0.01em',
      textTransform: headingTransform,
    },
    subheading: {
      fontFamily: t.headingFont,
      fontSize: modularSize(2),
      fontWeight: Math.max(400, t.fontWeightHeading - 100),
      lineHeight: hLineHeight + 0.1,
      letterSpacing: t.headingLetterSpacing ?? '-0.01em',
    },
    body: {
      fontFamily: t.bodyFont,
      fontSize: scaleSize(t.bodySize ?? '0.875rem'),
      fontWeight: t.fontWeightBody,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    metadata: {
      fontFamily: t.metadataFont ?? t.bodyFont,
      fontSize: scaleSize(t.captionSize ?? '0.75rem'),
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      textTransform: metadataTransform,
    },
    chartLabel: {
      fontFamily: t.monoFont ?? t.bodyFont,
      fontSize: scaleSize(t.captionSize ?? '0.75rem'),
      fontWeight: t.fontWeightBody,
      lineHeight: 1.2,
      letterSpacing: '0',
    },
    micro: {
      fontFamily: t.metadataFont ?? t.bodyFont,
      fontSize: scaleSize('0.625rem'),
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.1em',
      textTransform: metadataTransform,
    },
  };
}

/**
 * Returns a React style object from a dynamic theme-aware type scale.
 */
export function getThemeTextStyle(theme: ThemeTokens, scaleKey: TypeScaleKey): React.CSSProperties {
  const scale = buildTypeScale(theme);
  const entry = scale[scaleKey];
  return {
    fontFamily: entry.fontFamily,
    fontSize: entry.fontSize,
    fontWeight: entry.fontWeight,
    lineHeight: entry.lineHeight,
    letterSpacing: entry.letterSpacing,
    ...(entry.textTransform && entry.textTransform !== 'none' ? { textTransform: entry.textTransform } : {}),
  } as React.CSSProperties;
}
