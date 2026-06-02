// ─── Theme Token Validator ────────────────────────────────────────────────────
// Runtime validation for ThemeTokens (V2 — Theme DNA Engine).
// The renderer must NEVER crash due to malformed theme data.
//
// Strategy:
//   - Validate shape and value types
//   - Collect warnings (never throw)
//   - Log warnings in dev mode
//   - Return structured result
// ─────────────────────────────────────────────────────────────────────────────

import type { ThemeTokens } from './themeTypes';

export interface ValidationResult {
  /** Whether the theme is structurally complete */
  valid: boolean;
  /** Human-readable warnings for missing or malformed tokens */
  warnings: string[];
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string');
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|[a-z]+$)/;

function looksLikeColor(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return COLOR_PATTERN.test(value.trim());
}

// ─── Section Validators ──────────────────────────────────────────────────────

function validateColors(colors: unknown, warnings: string[]): void {
  if (!colors || typeof colors !== 'object') {
    warnings.push('[colors] Missing or not an object');
    return;
  }
  const c = colors as Record<string, unknown>;

  const requiredColorKeys = [
    'background', 'surface', 'surfaceSecondary', 'cardBackground',
    'border', 'divider', 'textPrimary', 'textSecondary', 'textMuted',
    'accentPrimary', 'accentSecondary', 'success', 'warning', 'danger',
    'grid', 'tooltipBackground', 'tooltipBorder',
  ];

  for (const key of requiredColorKeys) {
    if (!isNonEmptyString(c[key])) {
      warnings.push(`[colors.${key}] Missing or empty`);
    } else if (!looksLikeColor(c[key])) {
      warnings.push(`[colors.${key}] Value "${c[key]}" does not look like a valid color`);
    }
  }

  if (!isStringArray(c.chartPalette)) {
    warnings.push('[colors.chartPalette] Must be a non-empty array of color strings');
  }
}

function validateTypography(typography: unknown, warnings: string[]): void {
  if (!typography || typeof typography !== 'object') {
    warnings.push('[typography] Missing or not an object');
    return;
  }
  const t = typography as Record<string, unknown>;

  // Original fields
  for (const key of ['headingFont', 'bodyFont', 'titleSize', 'bodySize', 'captionSize']) {
    if (!isNonEmptyString(t[key])) {
      warnings.push(`[typography.${key}] Missing or empty`);
    }
  }
  for (const key of ['fontWeightHeading', 'fontWeightBody']) {
    if (!isPositiveNumber(t[key])) {
      warnings.push(`[typography.${key}] Must be a positive number`);
    }
  }

  // DNA extensions
  for (const key of ['displayFont', 'monoFont', 'metadataFont']) {
    if (!isNonEmptyString(t[key])) {
      warnings.push(`[typography.${key}] Missing or empty`);
    }
  }
  if (typeof t.fontScale === 'number') {
    if (t.fontScale < 0.5 || t.fontScale > 2.0) {
      warnings.push(`[typography.fontScale] Should be between 0.5 and 2.0, got ${t.fontScale}`);
    }
  } else if (t.fontScale !== undefined) {
    warnings.push('[typography.fontScale] Must be a number');
  }
  if (t.headingTransform !== undefined && !isOneOf(t.headingTransform, ['none', 'uppercase', 'small-caps'] as const)) {
    warnings.push('[typography.headingTransform] Must be "none", "uppercase", or "small-caps"');
  }
  if (t.headingLetterSpacing !== undefined && !isNonEmptyString(t.headingLetterSpacing)) {
    warnings.push('[typography.headingLetterSpacing] Must be a non-empty string');
  }
  if (t.metadataTransform !== undefined && !isOneOf(t.metadataTransform, ['none', 'uppercase'] as const)) {
    warnings.push('[typography.metadataTransform] Must be "none" or "uppercase"');
  }
}

function validateSpacing(spacing: unknown, warnings: string[]): void {
  if (!spacing || typeof spacing !== 'object') {
    warnings.push('[spacing] Missing or not an object');
    return;
  }
  const s = spacing as Record<string, unknown>;

  for (const key of ['pagePadding', 'sectionGap', 'cardPadding', 'gridGap']) {
    if (!isNonEmptyString(s[key])) {
      warnings.push(`[spacing.${key}] Missing or empty`);
    }
  }
}

function validateLayout(layout: unknown, warnings: string[]): void {
  if (!layout || typeof layout !== 'object') {
    warnings.push('[layout] Missing or not an object');
    return;
  }
  const l = layout as Record<string, unknown>;

  if (l.densityLevel !== undefined && !isOneOf(l.densityLevel, ['airy', 'comfortable', 'compact', 'dense'] as const)) {
    warnings.push('[layout.densityLevel] Must be "airy", "comfortable", "compact", or "dense"');
  }
  if (l.whitespaceScale !== undefined) {
    if (typeof l.whitespaceScale !== 'number' || l.whitespaceScale < 0.3 || l.whitespaceScale > 3.0) {
      warnings.push('[layout.whitespaceScale] Must be a number between 0.3 and 3.0');
    }
  }
  if (l.preferredHeroCount !== undefined) {
    if (typeof l.preferredHeroCount !== 'number' || l.preferredHeroCount < 0 || l.preferredHeroCount > 5) {
      warnings.push('[layout.preferredHeroCount] Must be a number between 0 and 5');
    }
  }
  if (l.gridSymmetry !== undefined && !isOneOf(l.gridSymmetry, ['symmetric', 'asymmetric'] as const)) {
    warnings.push('[layout.gridSymmetry] Must be "symmetric" or "asymmetric"');
  }
  if (l.maxContentWidth !== undefined && !isNonEmptyString(l.maxContentWidth)) {
    warnings.push('[layout.maxContentWidth] Must be a non-empty string');
  }
}

function validateCardStyle(cardStyle: unknown, warnings: string[]): void {
  if (!cardStyle || typeof cardStyle !== 'object') {
    warnings.push('[cardStyle] Missing or not an object');
    return;
  }
  const cs = cardStyle as Record<string, unknown>;

  // Original fields
  for (const key of ['borderRadius', 'borderWidth', 'shadow', 'hoverEffect']) {
    if (typeof cs[key] !== 'string') {
      warnings.push(`[cardStyle.${key}] Missing or not a string`);
    }
  }

  // Surface DNA extensions
  if (cs.glassmorphism !== undefined && (typeof cs.glassmorphism !== 'number' || cs.glassmorphism < 0 || cs.glassmorphism > 1)) {
    warnings.push('[cardStyle.glassmorphism] Must be a number between 0 and 1');
  }
  if (cs.backdropBlur !== undefined && typeof cs.backdropBlur !== 'string') {
    warnings.push('[cardStyle.backdropBlur] Must be a string');
  }
  if (cs.elevationModel !== undefined && !isOneOf(cs.elevationModel, ['flat', 'subtle', 'layered', 'deep'] as const)) {
    warnings.push('[cardStyle.elevationModel] Must be "flat", "subtle", "layered", or "deep"');
  }
  if (cs.borderStyle !== undefined && !isOneOf(cs.borderStyle, ['none', 'hairline', 'solid', 'heavy'] as const)) {
    warnings.push('[cardStyle.borderStyle] Must be "none", "hairline", "solid", or "heavy"');
  }
  if (cs.innerGlow !== undefined && !isBoolean(cs.innerGlow)) {
    warnings.push('[cardStyle.innerGlow] Must be a boolean');
  }
  if (cs.surfaceTexture !== undefined && !isOneOf(cs.surfaceTexture, ['clean', 'noise', 'grain'] as const)) {
    warnings.push('[cardStyle.surfaceTexture] Must be "clean", "noise", or "grain"');
  }
}

function validateChartStyle(chartStyle: unknown, warnings: string[]): void {
  if (!chartStyle || typeof chartStyle !== 'object') {
    warnings.push('[chartStyle] Missing or not an object');
    return;
  }
  const cs = chartStyle as Record<string, unknown>;

  // Original fields
  for (const key of ['gridOpacity', 'lineThickness', 'axisThickness', 'barRadius']) {
    if (!isNonNegativeNumber(cs[key])) {
      warnings.push(`[chartStyle.${key}] Must be a non-negative number`);
    }
  }
  if (typeof cs.tooltipBlur !== 'string') {
    warnings.push('[chartStyle.tooltipBlur] Missing or not a string');
  }

  // chartAccents
  if (!cs.chartAccents || typeof cs.chartAccents !== 'object') {
    warnings.push('[chartStyle.chartAccents] Missing or not an object');
  } else {
    const accents = cs.chartAccents as Record<string, unknown>;
    for (const key of ['bar', 'pie', 'line']) {
      if (!isNonEmptyString(accents[key])) {
        warnings.push(`[chartStyle.chartAccents.${key}] Missing or empty`);
      }
    }
  }

  // Chart DNA extensions
  if (cs.axisVisible !== undefined && !isBoolean(cs.axisVisible)) {
    warnings.push('[chartStyle.axisVisible] Must be a boolean');
  }
  if (cs.gridlineStyle !== undefined && !isOneOf(cs.gridlineStyle, ['none', 'dashed', 'solid', 'dotted'] as const)) {
    warnings.push('[chartStyle.gridlineStyle] Must be "none", "dashed", "solid", or "dotted"');
  }
  if (cs.tooltipStyle !== undefined && !isOneOf(cs.tooltipStyle, ['glass', 'solid', 'minimal', 'bordered'] as const)) {
    warnings.push('[chartStyle.tooltipStyle] Must be "glass", "solid", "minimal", or "bordered"');
  }
  if (cs.legendPlacement !== undefined && !isOneOf(cs.legendPlacement, ['bottom', 'right', 'inline', 'none'] as const)) {
    warnings.push('[chartStyle.legendPlacement] Must be "bottom", "right", "inline", or "none"');
  }
  if (cs.gradientIntensity !== undefined && (typeof cs.gradientIntensity !== 'number' || cs.gradientIntensity < 0 || cs.gradientIntensity > 1)) {
    warnings.push('[chartStyle.gradientIntensity] Must be a number between 0 and 1');
  }
  if (cs.dotStyle !== undefined && !isOneOf(cs.dotStyle, ['none', 'circle', 'square', 'diamond'] as const)) {
    warnings.push('[chartStyle.dotStyle] Must be "none", "circle", "square", or "diamond"');
  }
  if (cs.areaOpacity !== undefined && (typeof cs.areaOpacity !== 'number' || cs.areaOpacity < 0 || cs.areaOpacity > 1)) {
    warnings.push('[chartStyle.areaOpacity] Must be a number between 0 and 1');
  }
  if (cs.animationDuration !== undefined && !isNonNegativeNumber(cs.animationDuration)) {
    warnings.push('[chartStyle.animationDuration] Must be a non-negative number');
  }
}

function validateMotion(motion: unknown, warnings: string[]): void {
  if (!motion || typeof motion !== 'object') {
    warnings.push('[motion] Missing or not an object');
    return;
  }
  const m = motion as Record<string, unknown>;

  // Original fields
  if (!isNonEmptyString(m.transitionSpeed)) {
    warnings.push('[motion.transitionSpeed] Missing or empty');
  }
  if (!isPositiveNumber(m.hoverScale)) {
    warnings.push('[motion.hoverScale] Must be a positive number');
  }

  // Motion DNA extensions
  if (m.easing !== undefined && !isNonEmptyString(m.easing)) {
    warnings.push('[motion.easing] Must be a non-empty string');
  }
  if (m.hoverBehavior !== undefined && !isOneOf(m.hoverBehavior, ['none', 'lift', 'glow', 'tilt', 'scale'] as const)) {
    warnings.push('[motion.hoverBehavior] Must be "none", "lift", "glow", "tilt", or "scale"');
  }
  if (m.sectionEntrance !== undefined && !isOneOf(m.sectionEntrance, ['none', 'fade', 'slide', 'scale', 'stagger'] as const)) {
    warnings.push('[motion.sectionEntrance] Must be "none", "fade", "slide", "scale", or "stagger"');
  }
  if (m.staggerDelay !== undefined && !isNonNegativeNumber(m.staggerDelay)) {
    warnings.push('[motion.staggerDelay] Must be a non-negative number');
  }
  if (m.springStiffness !== undefined && !isPositiveNumber(m.springStiffness)) {
    warnings.push('[motion.springStiffness] Must be a positive number');
  }
  if (m.springDamping !== undefined && !isPositiveNumber(m.springDamping)) {
    warnings.push('[motion.springDamping] Must be a positive number');
  }
}

function validateMeta(meta: unknown, warnings: string[]): void {
  if (!meta || typeof meta !== 'object') {
    warnings.push('[meta] Missing or not an object');
    return;
  }
  const m = meta as Record<string, unknown>;

  if (!isNonEmptyString(m.themeName)) {
    warnings.push('[meta.themeName] Missing or empty');
  }
  if (!Array.isArray(m.mood)) {
    warnings.push('[meta.mood] Must be an array of strings');
  }
  if (m.appearance !== 'dark' && m.appearance !== 'light') {
    warnings.push('[meta.appearance] Must be "dark" or "light"');
  }
}

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * Validate a ThemeTokens object at runtime.
 *
 * - Never throws
 * - Returns structured result with warnings
 * - Logs warnings in dev mode
 */
export function validateThemeTokens(input: unknown): ValidationResult {
  const warnings: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, warnings: ['Theme input is not an object'] };
  }

  const theme = input as Record<string, unknown>;

  validateColors(theme.colors, warnings);
  validateTypography(theme.typography, warnings);
  validateSpacing(theme.spacing, warnings);
  validateLayout(theme.layout, warnings);
  validateCardStyle(theme.cardStyle, warnings);
  validateChartStyle(theme.chartStyle, warnings);
  validateMotion(theme.motion, warnings);
  validateMeta(theme.meta, warnings);

  const valid = warnings.length === 0;

  // Dev-mode logging
  if (import.meta.env.DEV && warnings.length > 0) {
    console.warn(
      `[ThemeValidator] ${warnings.length} warning(s) in theme tokens:\n` +
      warnings.map((w) => `  ⚠ ${w}`).join('\n')
    );
  }

  return { valid, warnings };
}

/**
 * Quick check: is the input a structurally complete ThemeTokens?
 */
export function isValidTheme(input: unknown): input is ThemeTokens {
  return validateThemeTokens(input).valid;
}
