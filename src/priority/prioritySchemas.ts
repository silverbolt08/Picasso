// ─── Priority Schemas (Validation & Normalization) ────────────────────────────
// Validates and normalizes raw LLM output before it reaches the consumer.
//
// Rules:
//   - priorityScore clamped to 0–100
//   - confidence clamped to 0–1
//   - rationale always non-empty
//   - matchedConcepts always an array
//   - Never throws — always returns a usable result
// ─────────────────────────────────────────────────────────────────────────────

import type { PriorityResult, PriorityBatchResult } from './priorityTypes';

// ─── Score Thresholds ─────────────────────────────────────────────────────────

/** Charts at or above this score are considered "high priority" */
export const HIGH_PRIORITY_THRESHOLD = 75;

/** Charts at or above this score are "hero" level */
export const HERO_PRIORITY_THRESHOLD = 90;

/** Default score for a chart when validation/parsing completely fails */
const FALLBACK_SCORE = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampFloat(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(clamped * 100) / 100; // 2 decimal places
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(v => typeof v === 'string') as string[];
}

function ensureNonEmptyString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return fallback;
}

// ─── Single Result Validation ─────────────────────────────────────────────────

/**
 * Validate and normalize a raw LLM PriorityResult object.
 * Always returns a usable PriorityResult — never throws.
 */
export function validatePriorityResult(
  raw: unknown,
  expectedTitle: string,
): PriorityResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return makeFallbackResult(expectedTitle, 'LLM returned non-object for this chart');
  }

  const r = raw as Record<string, unknown>;

  const chartTitle = ensureNonEmptyString(r.chartTitle, expectedTitle);
  const priorityScore = clampInt(r.priorityScore, 0, 100, FALLBACK_SCORE);
  const confidence = clampFloat(r.confidence, 0, 1, 0.5);
  const matchedConcepts = ensureStringArray(r.matchedConcepts);
  const rationale = ensureNonEmptyString(
    r.rationale,
    `Score of ${priorityScore} assigned based on semantic analysis.`,
  );
  const intentCategory = typeof r.intentCategory === 'string' && r.intentCategory.trim()
    ? r.intentCategory.trim()
    : undefined;

  return { 
    chartTitle, 
    priorityScore, 
    rawScore: priorityScore,
    rank: 0,
    percentile: 0,
    priorityTier: 'peripheral',
    matchedConcepts, 
    rationale, 
    confidence, 
    intentCategory 
  };
}

/**
 * Produce a fallback PriorityResult when parsing fails for a specific title.
 */
export function makeFallbackResult(title: string, reason: string): PriorityResult {
  return {
    chartTitle: title,
    priorityScore: FALLBACK_SCORE,
    rawScore: FALLBACK_SCORE,
    rank: 0,
    percentile: 0,
    priorityTier: 'peripheral',
    matchedConcepts: [],
    rationale: `Unable to score: ${reason}. Default score applied.`,
    confidence: 0.1,
    intentCategory: undefined,
  };
}

// ─── Batch Result Assembly ─────────────────────────────────────────────────────

/**
 * Validate a raw LLM array output and assemble a PriorityBatchResult.
 *
 * Strategy:
 *   - Match each validated result back to its expected title by chartTitle field
 *   - Any unmatched titles get a fallback result
 *   - Results sorted by priorityScore descending
 */
export function assembleBatchResult(
  rawArray: unknown,
  userIntent: string,
  expectedTitles: string[],
): PriorityBatchResult {
  const validated: PriorityResult[] = [];

  if (Array.isArray(rawArray)) {
    for (const item of rawArray) {
      const raw = item as Record<string, unknown>;
      const expectedTitle = typeof raw.chartTitle === 'string'
        ? (expectedTitles.find(t => t.toLowerCase() === raw.chartTitle?.toString().toLowerCase()) ?? raw.chartTitle as string)
        : expectedTitles[validated.length] ?? 'Unknown';
      validated.push(validatePriorityResult(item, expectedTitle));
    }
  }

  // Ensure every expected title has a result
  for (const title of expectedTitles) {
    const hasResult = validated.some(
      r => r.chartTitle.toLowerCase() === title.toLowerCase(),
    );
    if (!hasResult) {
      validated.push(makeFallbackResult(title, 'LLM did not return a score for this chart'));
    }
  }

  // Sort descending by score
  const rankings = [...validated].sort((a, b) => b.priorityScore - a.priorityScore);

  const totalCharts = rankings.length;
  const maxHeroes = totalCharts <= 4 ? 1 : 2;
  let heroesAssigned = 0;

  // Post-Process: Normalization, Quotas, Spread Compression
  for (let i = 0; i < totalCharts; i++) {
    const item = rankings[i];
    item.rawScore = item.priorityScore;

    // 1. Hero quota enforcement
    if (item.priorityScore >= HERO_PRIORITY_THRESHOLD) {
      if (heroesAssigned < maxHeroes) {
        heroesAssigned++;
      } else {
        // Demote to top of 'primary' band (89) or just below previous item
        item.priorityScore = Math.min(89, i > 0 ? rankings[i - 1].priorityScore - 1 : 89);
      }
    }

    // 2. Forced separation (spread compression)
    if (i > 0) {
      const prev = rankings[i - 1];
      const minGap = 5;
      if (prev.priorityScore - item.priorityScore < minGap) {
        item.priorityScore = Math.max(0, prev.priorityScore - minGap);
      }
    }

    // 3. Assign Tier and Metadata
    item.priorityTier = getPriorityTier(item.priorityScore);
    item.rank = i + 1;
    item.percentile = totalCharts > 1 ? Math.round(((totalCharts - item.rank) / (totalCharts - 1)) * 100) : 100;
  }

  // Top charts: score ≥ threshold
  const topCharts = rankings
    .filter(r => r.priorityScore >= HIGH_PRIORITY_THRESHOLD)
    .map(r => r.chartTitle);

  // Dominant category from highest-scoring result with a category
  const dominantCategory = rankings.find(r => r.intentCategory)?.intentCategory ?? 'general';

  return {
    userIntent,
    rankings,
    topCharts,
    dominantCategory,
    scoredAt: new Date().toISOString(),
  };
}

// ─── Score Color Helpers ──────────────────────────────────────────────────────

/** Returns a CSS color class description for a priority score */
export function getPriorityColor(score: number): 'high' | 'medium' | 'low' {
  if (score >= HERO_PRIORITY_THRESHOLD) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/** Returns a label for a priority score */
export function getPriorityLabel(score: number): string {
  if (score >= 90) return 'Hero';
  if (score >= 75) return 'Primary';
  if (score >= 50) return 'Secondary';
  if (score >= 20) return 'Supporting';
  return 'Peripheral';
}

/** Returns the exact priority tier */
export function getPriorityTier(score: number): import('./priorityTypes').PriorityTier {
  if (score >= 90) return 'hero';
  if (score >= 75) return 'primary';
  if (score >= 50) return 'secondary';
  if (score >= 20) return 'supporting';
  return 'peripheral';
}
