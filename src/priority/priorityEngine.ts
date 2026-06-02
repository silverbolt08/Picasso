// ─── Priority Engine ──────────────────────────────────────────────────────────
// THE SEMANTIC RELEVANCE SCORING ENGINE.
//
// This is the ONLY place that calls the AI for priority scoring.
//
// Input:  User intent + chart titles (NEVER chart data)
// Output: PriorityScoringResult with ranked PriorityBatchResult
//
// Design:
//   - One batch API call scores ALL chart titles simultaneously
//   - Consistent relative scoring (model sees all titles together)
//   - Deterministic: same input → same ranking order
//   - Resilient: malformed output → fallback scores, never crashes
//
// Pipeline position:
//   User Intent + [Chart Titles]
//     ↓ scoreChartPriority() / scoreDashboardPriorities()
//     ↓ Gemini (semantic analysis only)
//     ↓ assembleBatchResult() (validate + sort)
//     ↓ PriorityScoringResult → Dashboard Composer (future)
// ─────────────────────────────────────────────────────────────────────────────

import { getGeminiClient, getGeminiModelName } from '../ai/geminiClient';
import {
  assembleBatchResult,
  makeFallbackResult,
} from './prioritySchemas';
import {
  PRIORITY_SYSTEM_PROMPT,
  buildPriorityUserMessage,
  buildSinglePriorityUserMessage,
} from './priorityPrompts';
import type {
  PriorityBatchResult,
  PriorityResult,
  ScoreChartPriorityInput,
  ScoreDashboardPrioritiesInput,
  PriorityScoringResult,
  PriorityEngineError,
} from './priorityTypes';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function makeError(
  type: PriorityEngineError['type'],
  message: string,
  rawOutput?: string,
): PriorityEngineError {
  return { type, message, rawOutput };
}

function makeFallbackBatch(
  userIntent: string,
  chartTitles: string[],
  reason: string,
): PriorityBatchResult {
  const rankings = chartTitles.map(t => makeFallbackResult(t, reason));
  return {
    userIntent,
    rankings,
    topCharts: [],
    dominantCategory: 'general',
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Strip markdown code fences and clean up raw LLM text output.
 */
function cleanRawOutput(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Call Gemini and return the parsed array.
 * Returns null on any failure and sets error.
 */
async function callGemini(
  userMessage: string,
): Promise<{ parsed: unknown; rawOutput: string; error: PriorityEngineError | null }> {
  let rawOutput = '';
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: getGeminiModelName(),
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.15,      // Very low temperature for consistent scoring
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      systemInstruction: PRIORITY_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userMessage);
    rawOutput = result.response.text().trim();

    const cleaned = cleanRawOutput(rawOutput);
    const parsed = JSON.parse(cleaned);
    return { parsed, rawOutput, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (import.meta.env.DEV) {
      console.error('[PriorityEngine] Gemini call failed:', message);
      if (rawOutput) console.warn('[PriorityEngine] Raw output:', rawOutput);
    }
    const errorType = rawOutput ? 'parse_error' : 'api_error';
    return {
      parsed: null,
      rawOutput,
      error: makeError(errorType, message, rawOutput),
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Score a single chart title against a user intent.
 *
 * Note: Prefer scoreDashboardPriorities() when scoring multiple charts —
 * it uses one API call and produces more consistent relative rankings.
 */
export async function scoreChartPriority(
  input: ScoreChartPriorityInput,
): Promise<{ result: PriorityResult; error: PriorityEngineError | null; durationMs: number }> {
  const start = Date.now();
  const { userIntent, chartTitle } = input;

  if (!userIntent.trim() || !chartTitle.trim()) {
    return {
      result: makeFallbackResult(chartTitle, 'Empty input'),
      error: makeError('empty_input', 'userIntent and chartTitle must not be empty'),
      durationMs: 0,
    };
  }

  const userMessage = buildSinglePriorityUserMessage(userIntent, chartTitle);
  const { parsed, error } = await callGemini(userMessage);

  if (error || !parsed) {
    return {
      result: makeFallbackResult(chartTitle, error?.message ?? 'Unknown error'),
      error,
      durationMs: Date.now() - start,
    };
  }

  // Extract single result from the returned array
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const batch = assembleBatchResult(arr, userIntent, [chartTitle]);
  return {
    result: batch.rankings[0] ?? makeFallbackResult(chartTitle, 'Empty result array'),
    error: null,
    durationMs: Date.now() - start,
  };
}

/**
 * Score ALL chart titles against a user intent in ONE batch API call.
 *
 * This is the PRIMARY scoring method. It:
 *   - Sends all titles in a single prompt (consistent relative scoring)
 *   - Validates and normalizes all results
 *   - Fills in fallback scores for any missing titles
 *   - Returns results sorted highest → lowest priority
 */
export async function scoreDashboardPriorities(
  input: ScoreDashboardPrioritiesInput,
): Promise<PriorityScoringResult> {
  const start = Date.now();
  const { userIntent, chartTitles } = input;

  // Guard: empty inputs
  if (!userIntent.trim()) {
    return {
      result: null,
      error: makeError('empty_input', 'userIntent must not be empty'),
      durationMs: 0,
    };
  }
  if (chartTitles.length === 0) {
    return {
      result: null,
      error: makeError('empty_input', 'chartTitles array must not be empty'),
      durationMs: 0,
    };
  }

  // Deduplicate titles while preserving order
  const uniqueTitles = [...new Set(chartTitles.map(t => t.trim()).filter(Boolean))];

  const userMessage = buildPriorityUserMessage(userIntent, uniqueTitles);
  const { parsed, error } = await callGemini(userMessage);

  if (error || !parsed) {
    return {
      result: makeFallbackBatch(userIntent, uniqueTitles, error?.message ?? 'API call failed'),
      error,
      durationMs: Date.now() - start,
    };
  }

  if (!Array.isArray(parsed)) {
    const parseError = makeError(
      'parse_error',
      'LLM returned non-array response',
      String(parsed),
    );
    return {
      result: makeFallbackBatch(userIntent, uniqueTitles, 'Non-array response from LLM'),
      error: parseError,
      durationMs: Date.now() - start,
    };
  }

  const batch = assembleBatchResult(parsed, userIntent, uniqueTitles);

  if (import.meta.env.DEV) {
    console.log('[PriorityEngine] Scored', uniqueTitles.length, 'charts in', Date.now() - start, 'ms');
    console.log('[PriorityEngine] Top charts:', batch.topCharts);
  }

  return { result: batch, error: null, durationMs: Date.now() - start };
}
