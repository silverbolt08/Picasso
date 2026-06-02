// ─── Semantic Validator ───────────────────────────────────────────────────────
// Validates and normalizes LLM output before it reaches the compiler.
//
// Rules:
//   - All numeric fields clamped to 0–100
//   - Enum fields validated against known values
//   - Missing fields filled from defaults
//   - Never throws — always returns a usable profile
// ─────────────────────────────────────────────────────────────────────────────

import type { SemanticStyleProfile, TypographyStyle, TypographyWeight, SemanticAppearance, ColorFamily } from './semanticTypes';
import { defaultSemanticProfile } from './semanticDefaults';

export interface SemanticValidationResult {
  profile: SemanticStyleProfile;
  warnings: string[];
  wasNormalized: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: unknown, field: string, warnings: string[]): number {
  if (typeof value !== 'number' || isNaN(value)) {
    warnings.push(`[${field}] Expected number, got ${typeof value}. Using default.`);
    return -1; // Sentinel — caller will use default
  }
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  if (clamped !== value) {
    warnings.push(`[${field}] Value ${value} clamped to ${clamped}`);
  }
  return clamped;
}

function clampDimension(
  value: unknown,
  field: string,
  defaultVal: number,
  warnings: string[],
): number {
  const result = clamp(value, field, warnings);
  return result === -1 ? defaultVal : result;
}

const VALID_APPEARANCES: SemanticAppearance[] = ['dark', 'light'];
const VALID_TYPOGRAPHY_STYLES: TypographyStyle[] = ['modern', 'technical', 'retro', 'editorial', 'playful'];
const VALID_TYPOGRAPHY_WEIGHTS: TypographyWeight[] = ['light', 'medium', 'bold'];
const VALID_COLOR_FAMILIES: ColorFamily[] = ['green', 'cyan', 'blue', 'purple', 'pink', 'red', 'orange', 'gold', 'warm', 'neutral'];

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * Validate and normalize a raw LLM output object into a clean SemanticStyleProfile.
 * Missing fields are filled from defaults. Out-of-range values are clamped.
 * Never throws.
 */
export function validateSemanticProfile(raw: unknown): SemanticValidationResult {
  const warnings: string[] = [];
  const def = defaultSemanticProfile;

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    warnings.push('Input is not an object — using full default profile');
    return { profile: { ...def }, warnings, wasNormalized: true };
  }

  const input = raw as Record<string, unknown>;

  // ── Appearance ─────────────────────────────────────────────────────────
  const appearanceRaw = input.appearance as string;
  const appearance: SemanticAppearance = VALID_APPEARANCES.includes(appearanceRaw as SemanticAppearance)
    ? (appearanceRaw as SemanticAppearance)
    : (() => { warnings.push(`[appearance] Invalid "${appearanceRaw}" — using "${def.appearance}"`); return def.appearance; })();

  // ── Mood ───────────────────────────────────────────────────────────────
  const moodRaw = input.mood;
  const mood: string[] = Array.isArray(moodRaw) && moodRaw.every(m => typeof m === 'string')
    ? moodRaw as string[]
    : (() => { warnings.push('[mood] Expected string[] — using defaults'); return [...def.mood]; })();

  // ── Color Family ───────────────────────────────────────────────────────
  const colorFamilyRaw = input.colorFamily as string;
  const colorFamily: ColorFamily = VALID_COLOR_FAMILIES.includes(colorFamilyRaw as ColorFamily)
    ? (colorFamilyRaw as ColorFamily)
    : (() => { warnings.push(`[colorFamily] Invalid "${colorFamilyRaw}" — using "neutral"`); return 'neutral' as ColorFamily; })();

  // ── Numeric dimensions ─────────────────────────────────────────────────
  const D = (key: keyof typeof def, fallback?: number) =>
    clampDimension((input as Record<string, unknown>)[key], key as string, fallback ?? (def[key] as number), warnings);

  const energy = D('energy');
  const softness = D('softness');
  const density = D('density');
  const futurism = D('futurism');
  const luxury = D('luxury');
  const professionalism = D('professionalism');
  const playfulness = D('playfulness');
  const minimalism = D('minimalism');
  const expressiveness = D('expressiveness');

  // ── Geometry ───────────────────────────────────────────────────────────
  const geoRaw = (input.geometry && typeof input.geometry === 'object' && !Array.isArray(input.geometry))
    ? input.geometry as Record<string, unknown>
    : (() => { warnings.push('[geometry] Missing or invalid — using defaults'); return {} as Record<string, unknown>; })();

  const geometry = {
    roundness: clampDimension(geoRaw.roundness, 'geometry.roundness', def.geometry.roundness, warnings),
    sharpness: clampDimension(geoRaw.sharpness, 'geometry.sharpness', def.geometry.sharpness, warnings),
    borderStrength: clampDimension(geoRaw.borderStrength, 'geometry.borderStrength', def.geometry.borderStrength, warnings),
  };

  // ── Motion ─────────────────────────────────────────────────────────────
  const motRaw = (input.motion && typeof input.motion === 'object' && !Array.isArray(input.motion))
    ? input.motion as Record<string, unknown>
    : (() => { warnings.push('[motion] Missing or invalid — using defaults'); return {} as Record<string, unknown>; })();

  const motion = {
    intensity: clampDimension(motRaw.intensity, 'motion.intensity', def.motion.intensity, warnings),
    smoothness: clampDimension(motRaw.smoothness, 'motion.smoothness', def.motion.smoothness, warnings),
  };

  // ── Typography ─────────────────────────────────────────────────────────
  const typRaw = (input.typography && typeof input.typography === 'object' && !Array.isArray(input.typography))
    ? input.typography as Record<string, unknown>
    : (() => { warnings.push('[typography] Missing or invalid — using defaults'); return {} as Record<string, unknown>; })();

  const typStyleRaw = typRaw.style as string;
  const typStyle: TypographyStyle = VALID_TYPOGRAPHY_STYLES.includes(typStyleRaw as TypographyStyle)
    ? (typStyleRaw as TypographyStyle)
    : (() => { warnings.push(`[typography.style] Invalid "${typStyleRaw}" — using "${def.typography.style}"`); return def.typography.style; })();

  const typWeightRaw = typRaw.weight as string;
  const typWeight: TypographyWeight = VALID_TYPOGRAPHY_WEIGHTS.includes(typWeightRaw as TypographyWeight)
    ? (typWeightRaw as TypographyWeight)
    : (() => { warnings.push(`[typography.weight] Invalid "${typWeightRaw}" — using "${def.typography.weight}"`); return def.typography.weight; })();

  // ── Visual Language ────────────────────────────────────────────────────
  const vlRaw = (input.visualLanguage && typeof input.visualLanguage === 'object' && !Array.isArray(input.visualLanguage))
    ? input.visualLanguage as Record<string, unknown>
    : (() => { warnings.push('[visualLanguage] Missing or invalid — using defaults'); return {} as Record<string, unknown>; })();

  const visualLanguage = {
    glow: clampDimension(vlRaw.glow, 'visualLanguage.glow', def.visualLanguage.glow, warnings),
    transparency: clampDimension(vlRaw.transparency, 'visualLanguage.transparency', def.visualLanguage.transparency, warnings),
    layering: clampDimension(vlRaw.layering, 'visualLanguage.layering', def.visualLanguage.layering, warnings),
    noise: clampDimension(vlRaw.noise, 'visualLanguage.noise', def.visualLanguage.noise, warnings),
  };

  const profile: SemanticStyleProfile = {
    appearance, mood, colorFamily,
    energy, softness, density, futurism, luxury, professionalism, playfulness, minimalism, expressiveness,
    geometry, motion,
    typography: { style: typStyle, weight: typWeight },
    visualLanguage,
  };

  return { profile, warnings, wasNormalized: warnings.length > 0 };
}
