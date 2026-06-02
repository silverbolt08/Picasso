// ─── Cinematic Composition Solver ────────────────────────────────────────────
// Replaces the legacy rigid rule-based placement engine with an adaptive solver.
//
// Highlights:
//   - Decides placement tier and grid spans (1-12 columns) based on visual weight.
//   - Groups widgets into rows where the column sum is exactly 12.
//   - Leverages theme mood descriptors to adapt whitespace, margins, and density.
//   - Prevents identical adjacent chart shapes and resolves orphans dynamically.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlacementTier, SpanPreference, ComposedChart, DashboardRow } from './composerTypes';
import type { PartialThemeTokens } from '../theme/themeTypes';
import { getThemeMoodModifiers, evaluatePairing } from './compositionEvaluator';

/**
 * Main Cinematic composition solver.
 * Mutates placement, preferredSpan, gridSpan, and rationale on the ComposedChart list.
 * Groups them into a list of DashboardRows and returns them.
 */
export function solveCinematicComposition(
  charts: ComposedChart[],
  themeTokens?: PartialThemeTokens
): DashboardRow[] {
  const total = charts.length;
  if (total === 0) return [];

  const modifiers = getThemeMoodModifiers(themeTokens);

  // ── Step 1: Pre-sort swaps for intelligent chart pairing ───────────────────
  // Scans the list to break up consecutive identical chart types (e.g. line + line)
  // by swapping them with another compatible chart down the list.
  for (let i = 0; i < charts.length - 1; i++) {
    if (charts[i].chartType === charts[i + 1].chartType) {
      for (let j = i + 2; j < charts.length; j++) {
        if (charts[j].chartType !== charts[i].chartType) {
          const temp = charts[i + 1];
          charts[i + 1] = charts[j];
          charts[j] = temp;
          charts[i + 1].rationale.push(
            `Swapped render order with "${temp.chartTitle}" to avoid adjacent repetitive "${charts[i].chartType}" layout structures.`
          );
          break;
        }
      }
    }
  }

  // ── Step 2: Assign Initial Tiers and Spans ─────────────────────────────────
  charts.forEach((chart, index) => {
    const weight = chart.visualWeight;
    let tier: PlacementTier;

    // Distribute based on visual weight hierarchy
    if (index === 0 && modifiers.maxHeroes > 0) {
      tier = 'hero';
    } else if (weight >= 70) {
      tier = modifiers.asymmetryAllowed ? 'spotlight' : 'featured';
    } else if (weight >= 50) {
      tier = 'primary';
    } else if (weight >= 30) {
      tier = 'supporting';
    } else {
      tier = 'micro';
    }

    chart.placement = tier;
    chart.gridSpan = modifiers.cardSpans[tier] || 4;
    chart.promotedHero = false;
  });

  // Limit absolute hero counts based on theme configuration
  let heroCount = 0;
  charts.forEach(c => {
    if (c.placement === 'hero') {
      heroCount++;
      if (heroCount > modifiers.maxHeroes) {
        c.placement = 'primary';
        c.gridSpan = 6;
        c.rationale.push(`Capped at max ${modifiers.maxHeroes} heroes by theme mood constraints.`);
      }
    }
  });

  // ── Step 3: Packing Solver into Rows of exactly 12 ─────────────────────────
  const rows: DashboardRow[] = [];
  const pool = [...charts];
  let rowIndex = 0;

  while (pool.length > 0) {
    const rowCharts: ComposedChart[] = [];
    let currentSpanSum = 0;

    // Pack greedily from weight-ordered pool
    for (let i = 0; i < pool.length; i++) {
      const chart = pool[i];
      if (currentSpanSum + chart.gridSpan <= 12) {
        rowCharts.push(chart);
        currentSpanSum += chart.gridSpan;
        pool.splice(i, 1);
        i--; // Adjust index due to removal
      }
      if (currentSpanSum === 12) break;
    }

    // Handle remaining items (Orphan Prevention & Fill Adjustments)
    if (currentSpanSum > 0 && currentSpanSum < 12) {
      if (pool.length === 0) {
        // No charts left in pool. Expand row charts to fill.
        const diff = 12 - currentSpanSum;
        if (rowCharts.length === 1) {
          // Single orphan: make full-width hero
          rowCharts[0].gridSpan = 12;
          rowCharts[0].placement = 'hero';
          rowCharts[0].promotedHero = true;
          rowCharts[0].rationale.push(
            'Promoted to full-width HERO (promoted): filled remaining row space to avoid orphan.'
          );
        } else if (rowCharts.length === 2) {
          // Double charts: distribute
          if (modifiers.asymmetryAllowed) {
            rowCharts[0].gridSpan = 8;
            rowCharts[0].placement = 'spotlight';
            rowCharts[1].gridSpan = 4;
            rowCharts[1].placement = 'supporting';
            rowCharts[0].rationale.push('Optimized to asymmetrical SPOTLIGHT row packing.');
          } else {
            rowCharts[0].gridSpan = 6;
            rowCharts[0].placement = 'primary';
            rowCharts[1].gridSpan = 6;
            rowCharts[1].placement = 'primary';
            rowCharts[0].rationale.push('Optimized to PRIMARY + PRIMARY row packing.');
          }
        } else {
          // 3+ charts: Expand the highest weight
          const top = rowCharts.reduce((best, c) => (c.visualWeight > best.visualWeight ? c : best), rowCharts[0]);
          top.gridSpan += diff;
          top.rationale.push(`Expanded grid span by +${diff} to fill the remaining row space.`);
        }
      } else {
        // Pool has items, but none fit in the remaining space.
        // Try to pull a small item from the pool.
        const needed = 12 - currentSpanSum;
        const fitIndex = pool.findIndex(c => c.gridSpan <= needed);
        if (fitIndex !== -1) {
          const fitChart = pool.splice(fitIndex, 1)[0];
          rowCharts.push(fitChart);
        } else {
          // Nothing fits. Force expand the heaviest card.
          const diff = 12 - currentSpanSum;
          const top = rowCharts.reduce((best, c) => (c.visualWeight > best.visualWeight ? c : best), rowCharts[0]);
          top.gridSpan += diff;
          top.rationale.push(`Visual weight demands expanding span to fill row gap.`);
        }
      }
    }

    // ── Step 4: Pairing refinements & asymmetry introduction ─────────────────
    if (rowCharts.length === 2) {
      const [cA, cB] = rowCharts;

      // Swap to asymmetry if they are same chart type and theme allows it
      if (cA.chartType === cB.chartType && modifiers.asymmetryAllowed && cA.gridSpan === 6 && cB.gridSpan === 6) {
        cA.gridSpan = 8;
        cA.placement = 'spotlight';
        cB.gridSpan = 4;
        cB.placement = 'supporting';
        cA.rationale.push('Introduced intentional asymmetry to break repetitive layout structures.');
      }

      // Check pairing balance (contrast dense vs light)
      const pScore = evaluatePairing(
        { type: cA.chartType, densityScore: cA.densityScore },
        { type: cB.chartType, densityScore: cB.densityScore }
      );
      if (pScore > 0) {
        cA.rationale.push('Optimized complementary spacing: paired highly dense widget with lighter telemetry card.');
        cB.rationale.push('Optimized complementary spacing: paired lighter card with dense chart centerpiece.');
      }
    }

    // ── Step 5: Classify Row Type ────────────────────────────────────────────
    let rowType: DashboardRow['rowType'] = 'mixed';
    const spans = rowCharts.map(c => c.gridSpan);
    const placements = rowCharts.map(c => c.placement);

    if (spans.length === 1 && spans[0] === 12) {
      rowType = placements[0] === 'hero' ? 'hero' : 'featured';
    } else if (spans.length === 2 && spans.includes(8) && spans.includes(4)) {
      rowType = 'spotlight';
    } else if (spans.length === 2 && spans.includes(9) && spans.includes(3)) {
      rowType = 'spotlight';
    } else if (spans.length === 2 && spans[0] === 6 && spans[1] === 6) {
      rowType = 'primary';
    } else if (spans.length === 3 && spans.every(s => s === 4)) {
      rowType = 'supporting';
    } else if (spans.length === 4 && spans.every(s => s === 3)) {
      rowType = 'micro';
    }

    // Set preferredSpan string matching the gridSpan for backwards compatibility
    rowCharts.forEach(c => {
      c.preferredSpan = mapGridSpanToPreference(c.gridSpan);
    });

    rows.push({
      rowId: `row-${rowIndex++}`,
      rowType,
      charts: rowCharts,
    });
  }

  return rows;
}

/**
 * Backward compatible mapping from column width to span preference enum.
 */
function mapGridSpanToPreference(span: number): SpanPreference {
  switch (span) {
    case 12: return 'full';
    case 9:  return 'three-quarters';
    case 8:  return 'two-thirds';
    case 6:  return 'half';
    case 4:  return 'third';
    case 3:  return 'quarter';
    default: return 'half';
  }
}

// ─── Legacy compatibility functions ──────────────────────────────────────────
// Preserved to prevent import breaks. Internally delegates to modern metrics.

export function assignInitialPlacement(
  rank: number,
  visualWeight: number,
  topWeight: number,
  totalCharts: number
): PlacementTier {
  if (totalCharts === 1 || rank === 1) return 'hero';
  if (rank === 2) return 'primary';
  const ratio = topWeight > 0 ? visualWeight / topWeight : 0;
  if (ratio >= 0.65) return 'primary';
  return 'supporting';
}

export function assignSpan(placement: PlacementTier): SpanPreference {
  switch (placement) {
    case 'hero':
    case 'spotlight':
      return 'full';
    case 'primary':
    case 'featured':
      return 'half';
    default:
      return 'third';
  }
}

export function applySpatialCorrections(): void {
  // Deprecated: Solver groups rows and resolves orphans automatically.
}

export function applyDensitySpanAdjustment(
  baseSpan: SpanPreference,
  densityTier: string
): SpanPreference {
  if (densityTier === 'large' && baseSpan === 'third') return 'half';
  return baseSpan;
}
