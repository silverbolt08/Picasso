// ─── Weight Engine ────────────────────────────────────────────────────────────
// Calculates the composite visual weight for each chart.
//
// Visual weight fuses semantic + spatial intelligence:
//
//   visualWeight = (priorityScore * 0.7) + (normalizedDensityScore * 0.3)
//
// Priority dominates (70%) because semantic relevance is the primary
// driver of dashboard hierarchy. Density only modulates spatial pressure.
//
// Density is first normalized to 0–100 using the observed max across the
// batch so that one outlier doesn't collapse the rest.
// ─────────────────────────────────────────────────────────────────────────────

// ── Weight coefficients ───────────────────────────────────────────────────────

/** How much semantic priority contributes to visual weight */
export const PRIORITY_WEIGHT_COEFFICIENT = 0.7;

/** How much spatial density contributes to visual weight */
export const DENSITY_WEIGHT_COEFFICIENT = 0.3;

/**
 * Maximum density score used when no batch max is available.
 * Chosen to be comfortably above typical real-world scores.
 */
const DENSITY_NORMALIZATION_CEILING = 200;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Normalize a raw density score to 0–100.
 *
 * Uses the max observed across the batch as the ceiling so that scores are
 * relative to each other, not to an arbitrary absolute threshold.
 *
 * @param rawScore     - The raw density score for this chart
 * @param batchMax     - The maximum raw density score observed in the batch
 * @returns            - Normalized score in [0, 100]
 */
export function normalizeDensityScore(rawScore: number, batchMax: number): number {
  const ceiling = Math.max(batchMax, DENSITY_NORMALIZATION_CEILING);
  const normalized = (rawScore / ceiling) * 100;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

/**
 * Calculate the composite visual weight for a single chart.
 *
 * Formula: (priorityScore * 0.7) + (normalizedDensityScore * 0.3)
 *
 * @param priorityScore        - Semantic priority (0–100, from Priority Engine)
 * @param normalizedDensity    - Density normalized to 0–100
 * @returns                    - Visual weight in [0, 100], rounded to 1 decimal
 */
export function calculateVisualWeight(
  priorityScore: number,
  normalizedDensity: number,
  chartType?: string,
): number {
  let complexityAdjustment = 0;
  if (chartType === 'line') {
    complexityAdjustment = 5.0; // Lines have high visual density
  } else if (chartType === 'bar') {
    complexityAdjustment = 3.0; // Bars have structural visual weight
  }

  const weight =
    priorityScore * PRIORITY_WEIGHT_COEFFICIENT +
    normalizedDensity * DENSITY_WEIGHT_COEFFICIENT +
    complexityAdjustment;

  return Math.round(Math.min(100, Math.max(0, weight)) * 10) / 10;
}

/**
 * Find the maximum raw density score across a set of charts.
 * Used to establish the normalization ceiling for a batch.
 */
export function getBatchDensityMax(densityScores: number[]): number {
  if (densityScores.length === 0) return DENSITY_NORMALIZATION_CEILING;
  return Math.max(...densityScores, 1); // at least 1 to avoid divide-by-zero
}
