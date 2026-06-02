import type { ChartConfig } from '../types';

/** Generate a stable id for a chart if one wasn't provided */
export function ensureChartIds(charts: ChartConfig[]): ChartConfig[] {
  return charts.map((c, i) => ({
    ...c,
    id: c.id ?? `chart-${i}-${c.type}-${c.title.replace(/\s+/g, '-').toLowerCase()}`,
  }));
}

/** Parse a raw JSON string into ChartConfig[].  Returns null on failure. */
export function parseChartJson(raw: string): ChartConfig[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Basic shape validation
    const valid = parsed.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        ['bar', 'pie', 'line'].includes(item.type) &&
        typeof item.title === 'string' &&
        Array.isArray(item.data)
    );
    return valid ? (parsed as ChartConfig[]) : null;
  } catch {
    return null;
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
