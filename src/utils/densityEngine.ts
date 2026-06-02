import type { ChartConfig, ChartType, PreferredSpan } from '../types';

export const DENSITY_WEIGHTS = {
  labelLength: 0.6,
  pointCount: 0.3,
  chartTypeMultiplier: {
    pie: 1,
    bar: 2,
    line: 2,
  } satisfies Record<ChartType, number>,
} as const;

export const DENSITY_THRESHOLDS = {
  compactMax: 25,
  mediumMax: 60,
} as const;

export const DENSITY_EXPLANATION_THRESHOLDS = {
  longLabelLength: 12,
  avgLabelLength: 8,
  manyLabels: 8,
} as const;

export interface ChartDensityMeta {
  avgLabelLength: number;
  maxLabelLength: number;
  labelCount: number;
  pointCount: number;
  chartType: ChartType;
  chartTypeMultiplier: number;
}

export interface DensityDebugMeta extends ChartDensityMeta {
  densityScore: number;
  preferredSpan: PreferredSpan;
  formula: string;
  explanation: string;
}

function formatMetric(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function getAverageLabelLength(labels: string[]): number {
  if (labels.length === 0) return 0;
  const total = labels.reduce((sum, label) => sum + label.length, 0);
  return total / labels.length;
}

function getMaxLabelLength(labels: string[]): number {
  if (labels.length === 0) return 0;
  return labels.reduce((max, label) => Math.max(max, label.length), 0);
}

export function getChartDensityMeta(chart: ChartConfig): ChartDensityMeta {
  const labels = chart.data.map((point) => point.label);
  const labelCount = labels.length;
  const pointCount = chart.data.length;
  const avgLabelLength = getAverageLabelLength(labels);
  const maxLabelLength = getMaxLabelLength(labels);
  const chartTypeMultiplier = DENSITY_WEIGHTS.chartTypeMultiplier[chart.type] ?? 0;

  return {
    avgLabelLength,
    maxLabelLength,
    labelCount,
    pointCount,
    chartType: chart.type,
    chartTypeMultiplier,
  };
}

export function computeDensityScoreFromMeta(meta: ChartDensityMeta): number {
  return (
    meta.avgLabelLength * meta.labelCount * DENSITY_WEIGHTS.labelLength +
    meta.pointCount * DENSITY_WEIGHTS.pointCount +
    meta.chartTypeMultiplier
  );
}

export function computeDensityScore(chart: ChartConfig): number {
  return computeDensityScoreFromMeta(getChartDensityMeta(chart));
}

export function getPreferredSpanForScore(score: number): PreferredSpan {
  if (score <= DENSITY_THRESHOLDS.compactMax) return 'compact';
  if (score <= DENSITY_THRESHOLDS.mediumMax) return 'medium';
  return 'large';
}

export function getPreferredSpan(chart: ChartConfig): PreferredSpan {
  return getPreferredSpanForScore(computeDensityScore(chart));
}

function getDensityFormula(meta: ChartDensityMeta): string {
  const avg = formatMetric(meta.avgLabelLength);
  const labelWeight = formatMetric(DENSITY_WEIGHTS.labelLength);
  const pointWeight = formatMetric(DENSITY_WEIGHTS.pointCount);
  const typeMultiplier = formatMetric(meta.chartTypeMultiplier);

  return `(${avg} * ${meta.labelCount} * ${labelWeight}) + (${meta.pointCount} * ${pointWeight}) + ${typeMultiplier}`;
}

function getDensityExplanation(
  meta: ChartDensityMeta,
  preferredSpan: PreferredSpan
): string {
  const isPie = meta.chartType === 'pie';
  const isLine = meta.chartType === 'line';
  const hasLongLabels = meta.maxLabelLength >= DENSITY_EXPLANATION_THRESHOLDS.longLabelLength;
  const hasLongAverage = meta.avgLabelLength >= DENSITY_EXPLANATION_THRESHOLDS.avgLabelLength;
  const hasManyLabels = meta.labelCount >= DENSITY_EXPLANATION_THRESHOLDS.manyLabels;

  if (preferredSpan === 'large') {
    if (hasLongLabels || hasLongAverage) {
      return 'Placed as HERO because long labels increase horizontal pressure.';
    }
    if (hasManyLabels) {
      return 'Placed as HERO because many labels increase visual density.';
    }
    return 'Placed as HERO because density exceeds the large threshold.';
  }

  if (preferredSpan === 'medium') {
    if (isPie) {
      return 'Medium placement because density exceeds compact threshold despite pie efficiency.';
    }
    if (hasLongLabels || hasLongAverage) {
      return 'Medium placement because labels are lengthy and need breathing room.';
    }
    return 'Medium placement because density exceeds compact threshold.';
  }

  if (isPie) {
    return 'Compact placement because pie charts are spatially efficient.';
  }
  if (isLine) {
    return 'Compact placement because line charts tolerate shrinking.';
  }
  return 'Compact placement because density is below compact threshold.';
}

export function getDensityDebugMeta(chart: ChartConfig): DensityDebugMeta {
  const meta = getChartDensityMeta(chart);
  const densityScore = computeDensityScoreFromMeta(meta);
  const preferredSpan = getPreferredSpanForScore(densityScore);

  return {
    ...meta,
    densityScore,
    preferredSpan,
    formula: getDensityFormula(meta),
    explanation: getDensityExplanation(meta, preferredSpan),
  };
}
