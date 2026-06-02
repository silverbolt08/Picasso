// ─── Core Data Types ────────────────────────────────────────────────────────

/** A single data point in any chart */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Supported chart types */
export type ChartType = 'bar' | 'pie' | 'line';

/** Preferred layout span for a chart based on density */
export type PreferredSpan = 'compact' | 'medium' | 'large';

// ─── Theme Types (re-exported from theme module) ────────────────────────────

export type {
  ThemeTokens,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeLayoutDNA,
  ThemeCardStyle,
  ThemeChartStyle,
  ThemeMotion,
  ThemeMeta,
  ThemeAppearance,
  PartialThemeTokens,
  DeepPartial,
  // DNA enum types
  DensityLevel,
  GridSymmetry,
  ElevationModel,
  BorderStyle,
  SurfaceTexture,
  GridlineStyle,
  TooltipStyle,
  LegendPlacement,
  DotStyle,
  HoverBehavior,
  SectionEntrance,
} from '../theme/themeTypes';

/** Full configuration for a single chart widget */
export interface ChartConfig {
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  /** Optional unique id; auto-generated if omitted */
  id?: string;
  /** Optional accent color override */
  color?: string;
}
