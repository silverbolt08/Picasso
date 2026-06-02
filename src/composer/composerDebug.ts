// ─── Composer Debug Utilities ─────────────────────────────────────────────────
// Helpers for generating explainability rationale strings and formatting
// ComposedChart data for the debug UI.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComposedChart, DashboardPlan, PlacementTier, SpanPreference } from './composerTypes';
import { PRIORITY_WEIGHT_COEFFICIENT, DENSITY_WEIGHT_COEFFICIENT } from './weightEngine';

// ─── Rationale generators ─────────────────────────────────────────────────────

/**
 * Generate a human-readable rationale array for a composed chart.
 * Each string is one bullet point of explanation in the debug UI.
 */
export function generateRationale(
  chart: ComposedChart,
  rank: number,
  totalCharts: number,
): string[] {
  const reasons: string[] = [];

  // Placement rationale
  reasons.push(placementRationale(chart.placement, rank, totalCharts, chart.visualWeight, chart.promotedHero));

  // Span rationale
  reasons.push(spanRationale(chart.preferredSpan, chart.placement, chart.densityTier));

  // Weight formula breakdown
  reasons.push(
    `Visual weight ${chart.visualWeight}: ` +
    `priority ${chart.priorityScore} × ${PRIORITY_WEIGHT_COEFFICIENT} + ` +
    `density ${chart.normalizedDensityScore} × ${DENSITY_WEIGHT_COEFFICIENT}.`
  );

  // Priority tier signal
  if (chart.priorityTier === 'hero' || chart.priorityTier === 'primary') {
    reasons.push(`Semantic tier "${chart.priorityTier}" confirms high narrative importance.`);
  } else if (chart.priorityTier === 'peripheral') {
    reasons.push(`Semantic tier "peripheral" — low relevance to current intent.`);
  }

  // Density signal
  if (chart.densityTier === 'large') {
    reasons.push(`High label density creates spatial pressure — span upgraded.`);
  } else if (chart.densityTier === 'compact') {
    reasons.push(`Low density — chart fits compact slot without information loss.`);
  }

  // Append any existing spatial correction rationale (added by applySpatialCorrections)
  // These are already on chart.rationale before this function is called,
  // but we regenerate fresh so we preserve them via a concat in the caller.

  return reasons;
}

function placementRationale(
  placement: PlacementTier,
  rank: number,
  total: number,
  weight: number,
  promotedHero: boolean,
): string {
  switch (placement) {
    case 'hero':
      if (promotedHero) return `Placed as PROMOTED HERO (rank #${rank} of ${total}) — elevated by spatial packing for cinematic pacing.`;
      if (rank === 1) return `Placed as HERO (rank #1 of ${total}) — highest visual weight ${weight}.`;
      return `Placed as HERO (rank #${rank}) — elevated by spatial packing rules.`;
    case 'spotlight':
      return `Placed as SPOTLIGHT (rank #${rank} of ${total}) — asymmetric focal panel with visual weight ${weight}.`;
    case 'featured':
      return `Placed as FEATURED (rank #${rank} of ${total}) — high narrative value panel with visual weight ${weight}.`;
    case 'primary':
      return `Placed as PRIMARY (rank #${rank} of ${total}) — visual weight ${weight}.`;
    case 'supporting':
      return `Placed as SUPPORTING (rank #${rank} of ${total}) — visual weight ${weight}.`;
    case 'micro':
      return `Placed as MICRO (rank #${rank} of ${total}) — high-density details panel with visual weight ${weight}.`;
    case 'ambient':
      return `Placed as AMBIENT (rank #${rank} of ${total}) — secondary telemetry panel with visual weight ${weight}.`;
  }
}

function spanRationale(
  span: SpanPreference,
  _placement: PlacementTier,
  densityTier: string,
): string {
  const densityNote = densityTier === 'large' ? ' (density upgraded span)' : '';
  switch (span) {
    case 'full':
      return `Full-width span${densityNote} — occupies entire row.`;
    case 'half':
      return `Half-width span${densityNote} — 2-column grid row.`;
    case 'third':
      return `Third-width span — 3-column grid row.`;
    case 'quarter':
      return `Quarter-width span — 4-column grid row.`;
    case 'two-thirds':
      return `Two-thirds width span — spotlight centerpiece layout.`;
    case 'three-quarters':
      return `Three-quarters width span — dramatic display layout.`;
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Format a visual weight number for display */
export function formatWeight(weight: number): string {
  return weight.toFixed(1);
}

/** Format a tier label for display with a leading emoji */
export function formatPlacementTier(tier: PlacementTier, promotedHero = false): string {
  if (tier === 'hero' && promotedHero) return '⬢ Promoted Hero';
  switch (tier) {
    case 'hero':       return '★ Hero';
    case 'spotlight':  return '✦ Spotlight';
    case 'featured':   return '⬡ Featured';
    case 'primary':    return '◆ Primary';
    case 'supporting': return '· Supporting';
    case 'micro':      return '▫ Micro';
    case 'ambient':    return '◌ Ambient';
  }
}

/** Format a span preference for display */
export function formatSpan(span: SpanPreference): string {
  switch (span) {
    case 'full':           return 'Full (12 col)';
    case 'half':           return 'Half (6 col)';
    case 'third':          return 'Third (4 col)';
    case 'quarter':        return 'Quarter (3 col)';
    case 'two-thirds':     return 'Two-Thirds (8 col)';
    case 'three-quarters': return 'Three-Quarters (9 col)';
  }
}

/** Generate a one-line summary of the entire DashboardPlan */
export function formatPlanSummary(plan: DashboardPlan): string {
  const total = plan.charts.length;
  const heroCount = plan.heroCharts.length;
  const primaryCount = plan.primaryCharts.length;
  const supportingCount = plan.supportingCharts.length;
  return (
    `${total} chart${total !== 1 ? 's' : ''} · ` +
    `${heroCount} hero/featured · ` +
    `${primaryCount} primary · ` +
    `${supportingCount} supporting`
  );
}

/** Get a color class name for a placement tier */
export function getPlacementColor(tier: PlacementTier): 'hero' | 'primary' | 'supporting' {
  if (tier === 'hero' || tier === 'spotlight') return 'hero';
  if (tier === 'primary' || tier === 'featured') return 'primary';
  return 'supporting';
}
