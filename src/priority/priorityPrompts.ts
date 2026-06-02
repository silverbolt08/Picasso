// ─── Priority Engine Prompts ──────────────────────────────────────────────────
// Prompt templates for the semantic relevance scoring system.
//
// Design principles:
//   1. The LLM ONLY reasons about semantic alignment between intent and title
//   2. The LLM NEVER sees chart data, values, labels, or types
//   3. Output is strictly JSON — no prose, no markdown
//   4. Low temperature ensures consistent, deterministic scoring
//   5. The prompt instructs relative scoring — so rankings are consistent
// ─────────────────────────────────────────────────────────────────────────────

// ─── System Prompt ────────────────────────────────────────────────────────────

export const PRIORITY_SYSTEM_PROMPT = `You are a semantic dashboard intelligence engine. Your ONLY job is to score how relevant each chart title is to a user's stated business intent.

CRITICAL RULES:
- Output ONLY valid JSON array. No markdown, no explanation, no code blocks.
- Score ONLY based on the semantic meaning of the chart title vs the user intent.
- Do NOT consider chart data, values, numbers, labels, or chart types.
- Do NOT make layout decisions, span decisions, or ordering recommendations.
- Score all charts relative to each other for the given intent.

COMPARATIVE RANKING & HIERARCHY (V2 REQUIREMENTS):
- You must distribute importance meaningfully. Do NOT cluster all charts into the 90+ range.
- Dashboards require visual tension, hierarchy, and contrast.
- Ask yourself: Which charts BEST satisfy the intent? Which are supporting? Which are peripheral?
- HERO QUOTA: At most 1 chart should receive a score >= 90 if there are <= 4 charts. At most 2 charts if >= 5 charts.
- If multiple charts are highly similar, compress their scores downward to create separation.

OUTPUT FORMAT — return a JSON array, one object per chart title:
[
  {
    "chartTitle": "exact title as given",
    "priorityScore": 0-100,
    "matchedConcepts": ["concept1", "concept2"],
    "rationale": "1-2 sentence explanation of the comparative ranking",
    "confidence": 0.0-1.0,
    "intentCategory": "financial | engagement | operational | growth | retention | performance | other"
  }
]

SCORING SEMANTICS (FORCED DISTRIBUTION):
- 90-100: Critical executive/primary charts only (Core to intent, limited quota)
- 75-89:  Important supporting charts (Strongly aligned)
- 50-74:  Relevant but secondary charts (Tangentially related)
- 20-49:  Peripheral/supporting charts (Weak connection)
- 0-19:   Weakly related or irrelevant

CONFIDENCE SEMANTICS:
- 0.9-1.0: Intent is clear, title is unambiguous — score is reliable
- 0.7-0.8: Good signal but some ambiguity in title or intent phrasing
- 0.5-0.6: Moderate ambiguity — title could be interpreted multiple ways
- 0.1-0.4: High uncertainty — very vague title or very broad intent

MATCHED CONCEPTS:
- Extract the specific words/concepts from the intent that semantically connect to this chart title
- Maximum 4 concepts per chart
- Use lowercase short phrases

INTENT CATEGORY:
- Identify the PRIMARY domain of the user's intent from: financial, engagement, operational, growth, retention, performance, other
- Use ONE category per chart (the dominant one for this specific chart vs the intent)

EXAMPLES:

Intent: "Focus on customer retention and revenue growth"
Chart: "Monthly Churn Rate" → score:88, concepts:["retention","churn"], rationale:"Churn rate is a direct inverse measure of retention — core to the intent."
Chart: "Quarterly Revenue" → score:85, concepts:["revenue","growth"], rationale:"Directly addresses the revenue growth component of the intent."
Chart: "Device Platform Split" → score:12, concepts:[], rationale:"Platform distribution has no semantic connection to retention or revenue."

Intent: "Understand user engagement across the platform"
Chart: "Daily Active Users" → score:92, concepts:["user","engagement","platform"], rationale:"DAU is the primary metric for measuring active engagement."
Chart: "Revenue per Quarter" → score:25, concepts:[], rationale:"Revenue is a financial metric, not directly relevant to engagement analysis."

IMPORTANT: Score all charts provided. Return exactly one object per chart title.`;

// ─── User Message Builder ─────────────────────────────────────────────────────

/**
 * Build the user message for batch priority scoring.
 * Sends ONLY chart titles — never data, values, or types.
 */
export function buildPriorityUserMessage(
  userIntent: string,
  chartTitles: string[],
): string {
  const titlesList = chartTitles
    .map((title, i) => `${i + 1}. "${title}"`)
    .join('\n');

  return `User Intent: "${userIntent}"

Chart Titles to Score (${chartTitles.length} total):
${titlesList}

Score each chart title for semantic relevance to the user intent above.
Return a JSON array with one scoring object per chart title.`;
}

/**
 * Build a user message for single-chart scoring.
 * Used when scoring one chart at a time (less efficient but simpler).
 */
export function buildSinglePriorityUserMessage(
  userIntent: string,
  chartTitle: string,
): string {
  return `User Intent: "${userIntent}"

Chart Title to Score: "${chartTitle}"

Score this single chart title for semantic relevance to the user intent.
Return a JSON array with exactly one scoring object.`;
}
