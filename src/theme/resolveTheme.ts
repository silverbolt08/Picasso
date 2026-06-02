// ─── Theme Resolution Layer ──────────────────────────────────────────────────
// Normalizes partial / incomplete ThemeTokens into a fully resolved set.
//
// Purpose:
//   LLM-generated themes may be sparse (only overriding a few colors).
//   The resolver deep-merges partial input over a known-good fallback theme,
//   guaranteeing a complete ThemeTokens object every time.
//
// Future pipeline:
//   User Prompt → LangChain → partial JSON → resolveTheme() → Renderer
// ─────────────────────────────────────────────────────────────────────────────

import type { ThemeTokens, PartialThemeTokens } from './themeTypes';
import { validateThemeTokens } from './themeValidator';
import { darkTheme } from './themes';

// ─── Deep Merge Utility ──────────────────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively merge `source` into `target`.
 * Arrays are replaced entirely (not concatenated).
 * Only plain objects are recursed into.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }

  return result as T;
}

// ─── Resolver ────────────────────────────────────────────────────────────────

/**
 * Resolve a partial theme into a complete ThemeTokens object.
 *
 * @param partial  - Sparse token input (e.g. from an LLM or user override)
 * @param fallback - Base theme to fill gaps from (defaults to darkTheme)
 * @returns A fully populated ThemeTokens — safe to pass directly to the renderer.
 *
 * In dev mode, logs any tokens that fell through to defaults.
 */
export function resolveTheme(
  partial: PartialThemeTokens,
  fallback: ThemeTokens = darkTheme,
): ThemeTokens {
  const resolved = deepMerge(
    fallback as unknown as Record<string, unknown>,
    partial as unknown as Record<string, unknown>,
  ) as unknown as ThemeTokens;

  // Validate the merged result
  if (import.meta.env.DEV) {
    const { warnings } = validateThemeTokens(resolved);
    if (warnings.length > 0) {
      console.warn(
        `[resolveTheme] Resolved theme still has ${warnings.length} issue(s) after merge:\n` +
        warnings.map((w) => `  ⚠ ${w}`).join('\n')
      );
    }
  }

  return resolved;
}
