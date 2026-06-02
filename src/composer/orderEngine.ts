// ─── Order Engine ─────────────────────────────────────────────────────────────
// Sorts composed charts into a deterministic render order that produces
// cinematic pacing and editorial rhythm.
//
// Render order (top to bottom):
//   1. TRUE HERO charts     — the headline centerpiece(s)
//   2. PRIMARY charts       — the balanced 2-column insights
//   3. PROMOTED HERO chart  — a visual interlude, full-width
//   4. SUPPORTING charts    — the compact 3-column supporting data
//
// This separation prevents back-to-back hero sections and creates a
// visual rhythm:  WIDE → GRID → WIDE → COMPACT
//
// Within each tier, charts are sorted by:
//   1. visualWeight DESC  (primary signal)
//   2. priorityScore DESC (tiebreak — semantic wins over spatial)
//   3. chartTitle ASC     (alphabetical stability)
//
// After sorting, assigns 1-indexed renderOrder to each chart.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComposedChart } from './composerTypes';

/**
 * Map a chart to its section order for cinematic pacing.
 *
 * 0 = true hero (renders first)
 * 1 = primary
 * 2 = promoted hero (renders between primary and supporting)
 * 3 = supporting (renders last)
 */
function sectionOrder(chart: ComposedChart): number {
  if (chart.placement === 'hero' && !chart.promotedHero) return 0;
  if (chart.placement === 'primary') return 1;
  if (chart.placement === 'hero' && chart.promotedHero) return 2;
  return 3; // supporting
}

/**
 * Compare two charts within the same section by weight.
 */
function intraSort(a: ComposedChart, b: ComposedChart): number {
  if (b.visualWeight !== a.visualWeight) return b.visualWeight - a.visualWeight;
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  return a.chartTitle.localeCompare(b.chartTitle);
}

/**
 * Sort charts into cinematic render order and assign renderOrder (1-indexed).
 *
 * True Hero → Primary → Promoted Hero → Supporting
 *
 * Returns a new sorted array. Mutates renderOrder in place.
 */
export function assignRenderOrder(charts: ComposedChart[]): ComposedChart[] {
  const sorted = [...charts].sort((a, b) => {
    const sectionA = sectionOrder(a);
    const sectionB = sectionOrder(b);

    // Different sections: order by section
    if (sectionA !== sectionB) return sectionA - sectionB;

    // Same section: order by weight within the section
    return intraSort(a, b);
  });

  // Assign 1-indexed renderOrder
  sorted.forEach((chart, index) => {
    chart.renderOrder = index + 1;
  });

  return sorted;
}
