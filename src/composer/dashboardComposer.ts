// ─── Dashboard Composer ───────────────────────────────────────────────────────
// THE ORCHESTRATION BRAIN.
//
// Fuses semantic intelligence (Priority Engine) with spatial intelligence
// (Density Engine) into a deterministic DashboardPlan.
//
// NO LLM CALLS HERE. This is a pure deterministic function.
//
// Pipeline:
//   ComposeDashboardPlanInput
//     → merge scores
//     → normalize density
//     → calculate visualWeight
//     → assign initial placement (3-tier: hero | primary | supporting)
//     → apply spatial packing corrections
//     → sort by render order
//     → generate rationale
//     → return DashboardPlan
//
// Version: 2.0.0 — Spatial Packing System
// ─────────────────────────────────────────────────────────────────────────────

import type { ComposedChart, DashboardPlan, ComposeDashboardPlanInput } from './composerTypes';
import {
  normalizeDensityScore,
  calculateVisualWeight,
  getBatchDensityMax,
} from './weightEngine';
import { solveCinematicComposition } from './placementEngine';
import { generateRationale } from './composerDebug';
import type { PartialThemeTokens } from '../theme/themeTypes';

const ORCHESTRATION_VERSION = '2.2.0';

// ─── Default priority score when Priority Engine hasn't run ───────────────────

const DEFAULT_PRIORITY_SCORE = 50;
const DEFAULT_PRIORITY_TIER = 'supporting';

// ─── Main entrypoint ─────────────────────────────────────────────────────────

/**
 * Produce a complete DashboardPlan from chart metadata, density scores,
 * and (optionally) priority scores and theme tokens.
 *
 * If no priorityBatch is provided, all charts receive the default priority
 * score and the plan is driven purely by density.
 */
export function composeDashboardPlan(input: ComposeDashboardPlanInput): DashboardPlan {
  const { charts, densityByTitle, priorityBatch } = input;

  if (charts.length === 0) {
    return emptyPlan();
  }

  // ── Step 1: Collect raw density scores for normalization ceiling ────────────
  const rawDensityScores = charts.map(c => {
    const d = densityByTitle.get(c.title);
    return d?.densityScore ?? 0;
  });
  const batchDensityMax = getBatchDensityMax(rawDensityScores);

  // ── Step 2: Build priority lookup map from batch result ────────────────────
  const priorityByTitle = new Map<string, { score: number; tier: string }>();
  if (priorityBatch) {
    for (const r of priorityBatch.rankings) {
      priorityByTitle.set(r.chartTitle.toLowerCase(), {
        score: r.priorityScore,
        tier: r.priorityTier,
      });
    }
  }

  // ── Step 3: Build intermediate composed chart objects ──────────────────────
  const composed: ComposedChart[] = charts.map(chart => {
    const densityData  = densityByTitle.get(chart.title);
    const priorityData = priorityByTitle.get(chart.title.toLowerCase());

    const rawDensity    = densityData?.densityScore ?? 0;
    const densityTier   = densityData?.preferredSpan ?? 'compact';
    const priorityScore = priorityData?.score ?? DEFAULT_PRIORITY_SCORE;
    const priorityTier  = priorityData?.tier  ?? DEFAULT_PRIORITY_TIER;

    const normalizedDensity = normalizeDensityScore(rawDensity, batchDensityMax);
    const visualWeight = calculateVisualWeight(priorityScore, normalizedDensity, chart.type);

    return {
      chartId: chart.id,
      chartTitle: chart.title,
      chartType: chart.type,
      densityScore: rawDensity,
      normalizedDensityScore: normalizedDensity,
      priorityScore,
      densityTier,
      priorityTier,
      visualWeight,
      // Placeholders — assigned by composition solver
      placement: 'supporting' as const,
      preferredSpan: 'third' as const,
      gridSpan: 4,
      promotedHero: false,
      renderOrder: 0,
      rationale: [],
    };
  });

  // ── Step 4: Run Cinematic Composition Solver ───────────────────────────────
  const sortedByWeight = [...composed].sort((a, b) => b.visualWeight - a.visualWeight);
  const rows = solveCinematicComposition(sortedByWeight, input.themeTokens);

  // ── Step 5: Flatten charts from rows in visual flow order ──────────────────
  const ordered: ComposedChart[] = [];
  rows.forEach(row => {
    ordered.push(...row.charts);
  });

  // Assign 1-indexed renderOrder based on the final visual layout flow
  ordered.forEach((chart, index) => {
    chart.renderOrder = index + 1;
  });

  // ── Step 6: Generate rationale ─────────────────────────────────────────────
  const total = ordered.length;
  ordered.forEach((chart, index) => {
    const defaultRationale = generateRationale(chart, index + 1, total);
    chart.rationale = [...chart.rationale, ...defaultRationale];
  });

  // ── Step 7: Map to legacy arrays (for backward compatibility) ──────────────
  const heroCharts = ordered
    .filter(c => ['hero', 'spotlight', 'featured'].includes(c.placement))
    .map(c => c.chartId);

  const primaryCharts = ordered
    .filter(c => c.placement === 'primary')
    .map(c => c.chartId);

  const supportingCharts = ordered
    .filter(c => !['hero', 'spotlight', 'featured', 'primary'].includes(c.placement))
    .map(c => c.chartId);

  if (import.meta.env.DEV) {
    console.log('[DashboardComposer] Cinematic Plan:', {
      total,
      rows: rows.length,
      heroes: heroCharts.length,
      primaries: primaryCharts.length,
      supporting: supportingCharts.length,
      version: ORCHESTRATION_VERSION,
    });
  }

  return {
    charts: ordered,
    heroCharts,
    primaryCharts,
    supportingCharts,
    generatedAt: new Date().toISOString(),
    orchestrationVersion: ORCHESTRATION_VERSION,
    rows,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyPlan(): DashboardPlan {
  return {
    charts: [],
    heroCharts: [],
    primaryCharts: [],
    supportingCharts: [],
    generatedAt: new Date().toISOString(),
    orchestrationVersion: ORCHESTRATION_VERSION,
    rows: [],
  };
}

// ─── Convenience builder ──────────────────────────────────────────────────────

/**
 * Build a ComposeDashboardPlanInput from raw ChartConfigs and engine outputs.
 * Convenience wrapper so callers don't need to build the Map manually.
 */
export function buildComposerInput(
  charts: Array<{ id?: string; title: string; type: string }>,
  densityMetas: Array<{ title: string; densityScore: number; preferredSpan: string }>,
  priorityBatch?: import('../priority/priorityTypes').PriorityBatchResult,
  themeTokens?: PartialThemeTokens,
): ComposeDashboardPlanInput {
  const densityByTitle = new Map<string, { densityScore: number; preferredSpan: string }>();
  for (const d of densityMetas) {
    densityByTitle.set(d.title, { densityScore: d.densityScore, preferredSpan: d.preferredSpan });
  }

  return {
    charts: charts.map((c, i) => ({
      id: c.id ?? `chart-${i}`,
      title: c.title,
      type: c.type,
    })),
    densityByTitle,
    priorityBatch,
    themeTokens,
  };
}
