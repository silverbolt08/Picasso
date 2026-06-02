import type { PartialThemeTokens } from '../theme/themeTypes';

// ─── Composer Types ───────────────────────────────────────────────────────────
// Defines the complete contract for the Dashboard Composer output.
//
// The Composer is the orchestration brain. It fuses:
//   - semantic intelligence  (PriorityBatchResult)
//   - spatial intelligence   (DensityDebugMeta[])
//
// It produces a DashboardPlan — a deterministic, explainable layout plan
// that the renderer consumes as a READ-ONLY data structure.
//
// IMPORTANT: The Composer NEVER calls any LLM.
//            All intelligence is rule-driven and reproducible.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Where a chart sits in the visual hierarchy of the dashboard.
 * Picasso supports dynamic cinematic tiers:
 *
 * hero       → full-width centerpiece
 * primary    → standard half-width split
 * supporting → clean third-width structure
 * micro      → high-density telemetry (quarter-width)
 * featured   → highlighted editorial section
 * spotlight  → asymmetric focus dashboard panel (e.g. 2/3 width)
 * ambient    → low-density peripheral tracking
 */
export type PlacementTier =
  | 'hero'
  | 'primary'
  | 'supporting'
  | 'micro'
  | 'featured'
  | 'spotlight'
  | 'ambient';

/**
 * How much horizontal space a chart should prefer.
 */
export type SpanPreference =
  | 'full'
  | 'half'
  | 'third'
  | 'quarter'
  | 'two-thirds'
  | 'three-quarters';

/**
 * The complete orchestration result for a single chart.
 * This is what the renderer reads — it does NOT make decisions.
 */
export interface ComposedChart {
  /** Matches ChartConfig.id */
  chartId: string;

  /** Matches ChartConfig.title */
  chartTitle: string;

  /** Matches ChartConfig.type */
  chartType: string;

  // ── Input scores (from upstream engines) ───────────────────────────────────

  /** Raw density score from the density engine (unbounded, typically 0–200+) */
  densityScore: number;

  /** Normalized density score mapped to 0–100 */
  normalizedDensityScore: number;

  /** Semantic priority score from the Priority Engine (0–100) */
  priorityScore: number;

  // ── Tier labels ────────────────────────────────────────────────────────────

  /** Density tier label (from density engine: 'compact' | 'medium' | 'large') */
  densityTier: string;

  /** Semantic priority tier (from priority engine V2) */
  priorityTier: string;

  // ── Composer decision outputs ──────────────────────────────────────────────

  /**
   * Combined importance score.
   */
  visualWeight: number;

  /** Where in the dashboard hierarchy this chart belongs */
  placement: PlacementTier;

  /** How wide the chart should render */
  preferredSpan: SpanPreference;

  /** Width in columns (1-12) for grid packing */
  gridSpan: number;

  /**
   * True if this chart was promoted into HERO/SPOTLIGHT by a spatial correction rule
   * rather than by raw ranking.
   */
  promotedHero: boolean;

  /**
   * 1-indexed render order.
   * Lower = rendered first (top of page, left of grid).
   */
  renderOrder: number;

  /**
   * Human-readable reasoning for every decision the Composer made.
   * Suitable for optional explainability UI or logging.
   */
  rationale: string[];
}

/**
 * A dynamic row in the editorial layout.
 */
export interface DashboardRow {
  rowId: string;
  rowType: 'hero' | 'featured' | 'spotlight' | 'primary' | 'supporting' | 'mixed' | 'micro' | 'ambient';
  charts: ComposedChart[];
}

/**
 * The complete dashboard orchestration plan.
 * Produced by composeDashboardPlan() — consumed by the renderer.
 */
export interface DashboardPlan {
  /** All charts, sorted by renderOrder ascending */
  charts: ComposedChart[];

  /** IDs of charts assigned placement === 'hero' or equivalent */
  heroCharts: string[];

  /** IDs of charts assigned placement === 'primary' or equivalent */
  primaryCharts: string[];

  /** IDs of charts assigned placement === 'supporting' or equivalent */
  supportingCharts: string[];

  /** ISO timestamp of when this plan was generated */
  generatedAt: string;

  /**
   * Semantic version of the orchestration rules used.
   * Increment when rule logic changes to track which plan version was used.
   */
  orchestrationVersion: string;

  /**
   * Editorial cinematic rows for the dynamic renderer.
   */
  rows?: DashboardRow[];
}

// ─── Composer Input Types ─────────────────────────────────────────────────────

export interface ComposeDashboardPlanInput {
  /** The ChartConfig objects (id + title only used, data not read by composer) */
  charts: Array<{ id: string; title: string; type: string }>;

  /** Density results, keyed by chart title */
  densityByTitle: Map<string, { densityScore: number; preferredSpan: string }>;

  /**
   * Priority batch result. Optional — if not provided, composer runs in
   * density-only mode (all charts get equal semantic weight).
   */
  priorityBatch?: import('../priority/priorityTypes').PriorityBatchResult;

  /**
   * Current theme tokens. Used to adapt composition parameters to mood.
   */
  themeTokens?: PartialThemeTokens;
}
