// ─── LangChain Orchestration Pipeline ────────────────────────────────────────
// Central coordination layer for Picasso's intelligence engines.
//
// This pipeline uses LangChain as the ORCHESTRATION BACKBONE only.
// It does NOT generate layouts, positions, or CSS.
//
// Architecture:
//
//   PicassoRunInput
//         ↓
//   RunnableParallel   (all three run concurrently)
//   ├── themeChain     → PartialThemeTokens (calls Gemini via LangChain)
//   ├── priorityChain  → PriorityBatchResult (calls Gemini via LangChain)
//   └── densityChain   → DensityDebugMeta[] (deterministic, no LLM)
//         ↓
//   RunnableSequence
//         ↓
//   composerChain      → DashboardPlan (deterministic, no LLM)
//         ↓
//   PicassoPipelineOutput
//
// Design rules:
//   - LangChain only orchestrates — decision logic stays in the engines
//   - No LLM call happens inside the Composer
//   - The pipeline is future-ready: memory, agents, retrieval can be added
//     by wrapping any runnable in a MemorySaver or agent executor
//
// Future extension points (marked with "// FUTURE:"):
//   - Memory (conversation context across sessions)
//   - Agents (adaptive multi-step planning)
//   - Retrieval (RAG for domain-specific dashboard knowledge)
//   - Executive summary generation
// ─────────────────────────────────────────────────────────────────────────────

import { RunnableLambda, RunnableParallel } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { extractSemanticProfile } from '../ai/semanticExtractor';
import { semanticToTheme } from '../semantic/semanticToTheme';
import { scoreDashboardPriorities } from '../priority/priorityEngine';
import { getDensityDebugMeta } from '../utils/densityEngine';
import { composeDashboardPlan, buildComposerInput } from '../composer/dashboardComposer';

import type { ChartConfig } from '../types';
import type { DashboardPlan } from '../composer/composerTypes';
import type { PriorityBatchResult } from '../priority/priorityTypes';
import type { PartialThemeTokens } from '../theme/themeTypes';

// ─── Pipeline I/O types ───────────────────────────────────────────────────────

export interface PicassoRunInput {
  /** The charts to compose (titles are used by priority/density, data never leaves the density engine) */
  charts: ChartConfig[];

  /** Natural language aesthetic intent for the Theme Engine */
  themePrompt: string;

  /** Natural language business intent for the Priority Engine */
  userIntent: string;
}

export interface PicassoPipelineOutput {
  /** Resolved partial theme tokens from the Theme Engine */
  themeTokens: PartialThemeTokens;

  /** Priority batch result from the Priority Engine */
  priorityBatch: PriorityBatchResult | null;

  /** The final dashboard orchestration plan from the Composer */
  dashboardPlan: DashboardPlan;

  /** Duration of the pipeline run in milliseconds */
  durationMs: number;

  /** Any non-fatal warnings from the pipeline */
  warnings: string[];
}

// ─── Internal stage types ─────────────────────────────────────────────────────

interface ParallelStageOutput {
  themeTokens: PartialThemeTokens;
  priorityBatch: PriorityBatchResult | null;
  densityMetas: Array<{ title: string; densityScore: number; preferredSpan: string }>;
  warnings: string[];
}

// ─── Model factory ────────────────────────────────────────────────────────────

/**
 * Create the LangChain Gemini model instance.
 * Temperature is left to individual chains — they set it in their own logic.
 *
 * FUTURE: Swap for ChatAnthropic, ChatOpenAI, etc. with zero pipeline changes.
 */
function createModel() {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  const modelName = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.0-flash-lite';

  if (!apiKey) {
    throw new Error('VITE_GOOGLE_API_KEY is not set.');
  }

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey,
    temperature: 0.2,
  });
}

// ─── Individual Runnables ─────────────────────────────────────────────────────

/**
 * Theme Runnable
 * Accepts a theme prompt, calls the Semantic Extractor → compiles to tokens.
 * Uses existing extractSemanticProfile() which already calls Gemini internally.
 * Wrapped in RunnableLambda so it participates in the LangChain pipeline.
 */
const themeRunnable = RunnableLambda.from(async (input: PicassoRunInput): Promise<PartialThemeTokens> => {
  try {
    const extraction = await extractSemanticProfile(input.themePrompt);
    const compilation = semanticToTheme(extraction.profile);
    return compilation.tokens;
  } catch {
    // Return empty tokens on failure — ThemeProvider will resolve from base
    return {};
  }
});

/**
 * Priority Runnable
 * Accepts user intent + chart titles, calls the Priority Engine.
 * Uses existing scoreDashboardPriorities() which already calls Gemini internally.
 */
const priorityRunnable = RunnableLambda.from(async (input: PicassoRunInput): Promise<PriorityBatchResult | null> => {
  if (!input.userIntent?.trim() || input.charts.length === 0) return null;

  try {
    const chartTitles = input.charts.map(c => c.title);
    const result = await scoreDashboardPriorities({ userIntent: input.userIntent, chartTitles });
    return result.result;
  } catch {
    return null;
  }
});

/**
 * Density Runnable
 * Deterministic — no LLM call. Computes density metadata for all charts.
 * Wrapped in RunnableLambda to participate in RunnableParallel.
 */
const densityRunnable = RunnableLambda.from(
  (input: PicassoRunInput): Array<{ title: string; densityScore: number; preferredSpan: string }> => {
    return input.charts.map(chart => {
      const meta = getDensityDebugMeta(chart);
      return {
        title: chart.title,
        densityScore: meta.densityScore,
        preferredSpan: meta.preferredSpan,
      };
    });
  }
);

// ─── Parallel Stage ───────────────────────────────────────────────────────────

/**
 * Runs Theme, Priority, and Density in parallel.
 * All three receive the same PicassoRunInput.
 */
const parallelStage = RunnableParallel.from({
  themeTokens:  themeRunnable,
  priorityBatch: priorityRunnable,
  densityMetas:  densityRunnable,
}).pipe(
  // Attach warnings passthrough (no-op at this stage, reserved for future)
  RunnableLambda.from((result: {
    themeTokens: PartialThemeTokens;
    priorityBatch: PriorityBatchResult | null;
    densityMetas: Array<{ title: string; densityScore: number; preferredSpan: string }>;
  }): ParallelStageOutput => ({
    ...result,
    warnings: [],
  }))
);

/**
 * Composer Runnable
 * Deterministic fusion of parallel outputs → DashboardPlan.
 * Receives BOTH the original input (for charts) and the parallel output.
 */
const composerRunnable = RunnableLambda.from(
  (combined: { input: PicassoRunInput; parallel: ParallelStageOutput }): DashboardPlan => {
    const { input, parallel } = combined;
    const composerInput = buildComposerInput(
      input.charts,
      parallel.densityMetas,
      parallel.priorityBatch ?? undefined,
      parallel.themeTokens,
    );
    return composeDashboardPlan(composerInput);
  }
);

// ─── Full Pipeline ────────────────────────────────────────────────────────────

/**
 * The complete Picasso orchestration pipeline.
 *
 * Runs Theme + Priority + Density in parallel, then feeds all results into
 * the Dashboard Composer to produce a unified DashboardPlan.
 *
 * Usage:
 *   const output = await runPicassoPipeline({ charts, themePrompt, userIntent });
 *
 * FUTURE: Wrap this in a MemorySaver for cross-session context.
 * FUTURE: Add an ExecutiveSummaryRunnable after the composer stage.
 */
export async function runPicassoPipeline(
  input: PicassoRunInput,
): Promise<PicassoPipelineOutput> {
  const start = Date.now();

  // Ensure model is creatable (validates env vars) before committing to async work
  // We call createModel() here for validation but the runnables use the existing
  // engine clients directly (they manage their own clients).
  // FUTURE: Pass model into runnables via config for full LangChain model routing.
  try {
    createModel(); // validation only
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Return a plan with no AI enhancement
    return {
      themeTokens: {},
      priorityBatch: null,
      dashboardPlan: composeDashboardPlan(buildComposerInput(input.charts, [])),
      durationMs: Date.now() - start,
      warnings: [`Pipeline skipped AI stages: ${msg}`],
    };
  }

  // ── Run parallel stage ────────────────────────────────────────────────────
  const parallel = await parallelStage.invoke(input);

  // ── Run composer stage ────────────────────────────────────────────────────
  const dashboardPlan = await composerRunnable.invoke({ input, parallel });

  return {
    themeTokens: parallel.themeTokens,
    priorityBatch: parallel.priorityBatch,
    dashboardPlan,
    durationMs: Date.now() - start,
    warnings: parallel.warnings,
  };
}

// ─── Export model factory for external use ────────────────────────────────────
// Allows individual engine tests or future agents to reuse the same model config

export { createModel as createPicassoModel };

// FUTURE: Export individual runnables for agent-based composition
export { themeRunnable, priorityRunnable, densityRunnable, composerRunnable };
