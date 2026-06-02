import type { PartialThemeTokens } from '../theme/themeTypes';
import type { PlacementTier } from './composerTypes';

export interface MoodModifiers {
  targetDensity: 'low' | 'medium' | 'high' | 'ultra';
  whitespaceWeight: number;
  asymmetryAllowed: boolean;
  maxHeroes: number;
  forceGridSymmetry: boolean;
  cardSpans: Record<PlacementTier, number>;
}

/**
 * Extract layout adjustments based on the active theme's mood words.
 */
export function getThemeMoodModifiers(themeTokens?: PartialThemeTokens): MoodModifiers {
  const moods = themeTokens?.meta?.mood || [];
  const lowerMoods = Array.isArray(moods)
    ? moods.filter((m): m is string => typeof m === 'string').map(m => m.toLowerCase())
    : [];

  // Determine if it matches any of our theme classes
  const isLuxury = lowerMoods.some(m =>
    ['luxury', 'fintech', 'executive', 'premium', 'high-end', 'cinematic'].includes(m)
  );
  const isCyberpunk = lowerMoods.some(m =>
    ['cyberpunk', 'neon', 'cyber', 'futuristic', 'hacker', 'layered'].includes(m)
  );
  const isMinimal = lowerMoods.some(m =>
    ['minimal', 'editorial', 'clean', 'restrained', 'light', 'daylight'].includes(m)
  );
  const isMilitary = lowerMoods.some(m =>
    ['military', 'command', 'security', 'tactical', 'dense', 'operations'].includes(m)
  );

  if (isLuxury) {
    return {
      targetDensity: 'low',
      whitespaceWeight: 1.5,
      asymmetryAllowed: true,
      maxHeroes: 2,
      forceGridSymmetry: false,
      cardSpans: {
        hero: 12,
        spotlight: 8,
        featured: 8,
        primary: 6,
        supporting: 4,
        micro: 4,
        ambient: 4,
      },
    };
  }

  if (isCyberpunk) {
    return {
      targetDensity: 'high',
      whitespaceWeight: 0.75,
      asymmetryAllowed: true,
      maxHeroes: 2,
      forceGridSymmetry: false,
      cardSpans: {
        hero: 12,
        spotlight: 9,
        featured: 6,
        primary: 6,
        supporting: 4,
        micro: 3,
        ambient: 3,
      },
    };
  }

  if (isMinimal) {
    return {
      targetDensity: 'medium',
      whitespaceWeight: 1.25,
      asymmetryAllowed: false,
      maxHeroes: 1,
      forceGridSymmetry: true,
      cardSpans: {
        hero: 12,
        spotlight: 12,
        featured: 6,
        primary: 6,
        supporting: 4,
        micro: 4,
        ambient: 4,
      },
    };
  }

  if (isMilitary) {
    return {
      targetDensity: 'ultra',
      whitespaceWeight: 0.5,
      asymmetryAllowed: false,
      maxHeroes: 1,
      forceGridSymmetry: true,
      cardSpans: {
        hero: 12,
        spotlight: 6,
        featured: 6,
        primary: 6,
        supporting: 4,
        micro: 3,
        ambient: 3,
      },
    };
  }

  // Default Standard Layout
  return {
    targetDensity: 'medium',
    whitespaceWeight: 1.0,
    asymmetryAllowed: true,
    maxHeroes: 1,
    forceGridSymmetry: false,
    cardSpans: {
      hero: 12,
      spotlight: 8,
      featured: 8,
      primary: 6,
      supporting: 4,
      micro: 3,
      ambient: 3,
    },
  };
}

/**
 * Score compatibility between two adjacent charts to maximize visual balance.
 */
export function evaluatePairing(
  chartA: { type: string; densityScore: number },
  chartB: { type: string; densityScore: number }
): number {
  let score = 0;

  // Penalize side-by-side matching chart types (avoid repetitive shapes)
  if (chartA.type === chartB.type) {
    score -= 25;
  }

  // Reward balanced data density (dense chart beside low-density KPI/card)
  const densityDiff = Math.abs(chartA.densityScore - chartB.densityScore);
  if (densityDiff > 70) {
    score += 20; // Good contrast (e.g. dense line vs clean bar or light donut)
  }

  // Complementary pairings
  const types = new Set([chartA.type, chartB.type]);
  if (types.has('line') && types.has('bar')) {
    score += 15;
  }
  if (types.has('line') && types.has('pie')) {
    score += 15;
  }
  if (types.has('bar') && types.has('pie')) {
    score += 10;
  }

  return score;
}

/**
 * Score the rhythm of consecutive rows to maintain cinematic pacing.
 */
export function evaluateRowRhythm(prevRowType?: string, currRowType?: string): number {
  if (!prevRowType || !currRowType) return 0;

  // Penalize consecutive rows of the same type (prevents boring grids)
  if (prevRowType === currRowType) {
    return -20;
  }

  // Penalize back-to-back large/heavy centerpieces
  const heavyTiers = ['hero', 'spotlight'];
  if (heavyTiers.includes(prevRowType) && heavyTiers.includes(currRowType)) {
    return -40;
  }

  // Reward premium transitions: WIDE -> GRID -> COMPACT
  if (prevRowType === 'hero' && currRowType === 'primary') return 15;
  if (prevRowType === 'spotlight' && currRowType === 'supporting') return 15;
  if (prevRowType === 'primary' && currRowType === 'supporting') return 10;
  if (prevRowType === 'featured' && currRowType === 'micro') return 10;

  return 0;
}
