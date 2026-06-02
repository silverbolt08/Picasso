// ─── Priority Engine Types ────────────────────────────────────────────────────
// Defines the semantic relevance scoring contract.
//
// The Priority Engine asks ONE question:
//   "How relevant is this chart title to the user's stated intent?"
//
// It NEVER inspects:
//   - chart data or values
//   - KPI labels or trends
//   - chart types or layouts
//
// It ONLY analyzes:
//   - user intent (natural language)
//   - chart title (string)
//
// Pipeline position:
//   User Intent + Chart Titles
//     ↓ Priority Engine
//     ↓ PriorityBatchResult
//     ↓ Dashboard Composer (future)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalized semantic priority tiers for visual orchestration.
 */
export type PriorityTier =
  | 'hero'
  | 'primary'
  | 'secondary'
  | 'supporting'
  | 'peripheral';

/**
 * Semantic relevance score for a single chart title against a user intent.
 */
export interface PriorityResult {
  /** The chart title that was scored */
  chartTitle: string;

  /**
   * Final normalized semantic relevance score: 0–100
   * 90–100 = Critical executive/primary charts
   * 75–89  = Important supporting charts
   * 50–74  = Relevant but secondary charts
   * 20–49  = Peripheral/supporting charts
   * 0–19   = Weakly related or irrelevant
   */
  priorityScore: number;

  /**
   * The original score provided by the LLM before normalization and compression.
   */
  rawScore: number;

  /**
   * Ranked position within the batch (1-indexed).
   * 1 = highest priority score.
   */
  rank: number;

  /**
   * Percentile rank within the batch (0–100).
   * 100 = highest rank, 0 = lowest rank.
   */
  percentile: number;

  /**
   * Semantic priority tier, assigned based on the final normalized score.
   */
  priorityTier: PriorityTier;

  /**
   * Concepts from the intent that matched this chart title.
   * e.g. ["revenue", "growth"] for "Quarterly Revenue Growth" vs "Focus on revenue growth"
   */
  matchedConcepts: string[];

  /**
   * Human-readable explanation of why this score was assigned.
   * Always non-empty — used for explainability UI.
   */
  rationale: string;

  /**
   * Confidence in the scoring: 0–1
   * Low confidence = the title is ambiguous or intent is vague
   * High confidence = clear semantic alignment or misalignment
   */
  confidence: number;

  /**
   * The semantic category the intent belongs to (LLM-assigned).
   * Examples: "financial", "engagement", "operational", "growth", "retention"
   */
  intentCategory?: string;
}

/**
 * Result of scoring all chart titles against a single user intent.
 * Rankings are sorted highest priorityScore first.
 */
export interface PriorityBatchResult {
  /** The user intent that was scored against */
  userIntent: string;

  /**
   * All chart titles scored and sorted by descending priorityScore.
   * Always contains one entry per input title.
   */
  rankings: PriorityResult[];

  /**
   * Titles of the top-scoring charts (priorityScore ≥ 60).
   * Ordered highest-first. May be empty if no charts align with intent.
   */
  topCharts: string[];

  /** The dominant intent category identified by the LLM */
  dominantCategory: string;

  /** ISO timestamp of when this batch was scored */
  scoredAt: string;
}

// ─── Engine Input Types ───────────────────────────────────────────────────────

export interface ScoreChartPriorityInput {
  userIntent: string;
  chartTitle: string;
}

export interface ScoreDashboardPrioritiesInput {
  userIntent: string;
  /** Only the titles are passed — never the data */
  chartTitles: string[];
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface PriorityEngineError {
  type: 'api_error' | 'parse_error' | 'validation_error' | 'empty_input';
  message: string;
  rawOutput?: string;
}

export interface PriorityScoringResult {
  result: PriorityBatchResult | null;
  error: PriorityEngineError | null;
  durationMs: number;
}
