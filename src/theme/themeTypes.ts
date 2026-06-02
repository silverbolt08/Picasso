// ─── Theme Token Type System ─────────────────────────────────────────────────
// Strict, strongly-typed contract for the entire visual appearance layer.
// The renderer is fully token-driven: every visual decision flows from here.
//
// V2 – THEME DNA ENGINE
// Each theme defines a complete visual personality through 5 DNA strands:
//   1. Typography DNA — font families, scale, weight, transforms
//   2. Layout DNA     — density, whitespace, hero count, symmetry
//   3. Surface DNA    — radius, glass, shadow, borders, texture
//   4. Motion DNA     — easing, hover, entrance, springs
//   5. Chart DNA      — strokes, axes, gridlines, tooltips, legends
//
// Pipeline:
//   User Prompt → LangChain → ThemeTokens JSON → Validator → Resolver → Renderer
//
// The LLM will ONLY generate structured ThemeTokens — never raw CSS, Tailwind,
// or React code.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Color Tokens ────────────────────────────────────────────────────────────

export interface ThemeColors {
  /** Page-level background */
  background: string;
  /** Primary surface (panels, sidebars) */
  surface: string;
  /** Secondary surface (nested panels, muted areas) */
  surfaceSecondary: string;
  /** Card background */
  cardBackground: string;
  /** Standard border color */
  border: string;
  /** Divider / subtle separator */
  divider: string;

  /** Primary text */
  textPrimary: string;
  /** Secondary text (labels, descriptions) */
  textSecondary: string;
  /** Muted text (hints, disabled) */
  textMuted: string;

  /** Primary accent (CTAs, highlights) */
  accentPrimary: string;
  /** Secondary accent (complementary highlights) */
  accentSecondary: string;

  /** Semantic: success */
  success: string;
  /** Semantic: warning */
  warning: string;
  /** Semantic: danger / error */
  danger: string;

  /** Chart grid line color */
  grid: string;
  /** Tooltip background */
  tooltipBackground: string;
  /** Tooltip border */
  tooltipBorder: string;

  /** Ordered palette for chart series / pie slices */
  chartPalette: string[];
}

// ─── Typography DNA ──────────────────────────────────────────────────────────

export interface ThemeTypography {
  /** Font family for headings / display text */
  headingFont: string;
  /** Font family for body / UI text */
  bodyFont: string;
  /** Font family for hero / display-level text (can differ from heading) */
  displayFont: string;
  /** Monospace font for data, chart labels, KPI figures */
  monoFont: string;
  /** Font for metadata labels (may be mono or body) */
  metadataFont: string;

  /** Title font size (e.g. '1rem', '16px') */
  titleSize: string;
  /** Body font size */
  bodySize: string;
  /** Caption / small text size */
  captionSize: string;

  /** Font weight for headings (e.g. 700) */
  fontWeightHeading: number;
  /** Font weight for body text (e.g. 400) */
  fontWeightBody: number;

  /** Global font scale multiplier (0.8–1.3). Applied by renderer to all sizes */
  fontScale: number;
  /** Text transform for headings */
  headingTransform: 'none' | 'uppercase' | 'small-caps';
  /** Letter spacing for headings (e.g. '-0.02em', '0.1em') */
  headingLetterSpacing: string;
  /** Text transform for metadata / micro labels */
  metadataTransform: 'none' | 'uppercase';

  // ── Theme Morphing extensions ────────────────────────────────────────────

  /** Modular scale ratio for heading hierarchy (1.2 = minor third, 1.333 = perfect fourth, 1.618 = golden) */
  headingScale: number;
  /** Vertical spacing between paragraphs / content blocks (e.g. '1.5em', '2rem') */
  paragraphSpacing: string;
  /** Line height for headings (tighter than body) */
  headingLineHeight: number;
}

// ─── Spacing Tokens ──────────────────────────────────────────────────────────

export interface ThemeSpacing {
  /** Outer page padding */
  pagePadding: string;
  /** Gap between major sections */
  sectionGap: string;
  /** Inner card padding */
  cardPadding: string;
  /** Grid gap between cards */
  gridGap: string;
}

// ─── Layout DNA ──────────────────────────────────────────────────────────────

export type DensityLevel = 'airy' | 'comfortable' | 'compact' | 'dense';
export type GridSymmetry = 'symmetric' | 'asymmetric';

export interface ThemeLayoutDNA {
  /** Overall density level — affects spacing multipliers across the dashboard */
  densityLevel: DensityLevel;
  /** Whitespace multiplier (0.6 = tight, 1.0 = normal, 1.8 = generous) */
  whitespaceScale: number;
  /** Preferred number of hero-tier charts (0 = no heroes, up to 3) */
  preferredHeroCount: number;
  /** Grid layout preference: symmetric (equal columns) vs asymmetric (mixed widths) */
  gridSymmetry: GridSymmetry;
  /** Maximum content width for the dashboard container */
  maxContentWidth: string;
}

// ─── Surface DNA (Card Style) ────────────────────────────────────────────────

export type ElevationModel = 'flat' | 'subtle' | 'layered' | 'deep';
export type BorderStyle = 'none' | 'hairline' | 'solid' | 'heavy';
export type SurfaceTexture = 'clean' | 'noise' | 'grain';
export type SurfaceMode = 'elevated' | 'glass' | 'bordered' | 'invisible' | 'terminal' | 'editorial';

export interface ThemeCardStyle {
  /** Border radius (e.g. '1rem', '16px', '0px', '999px') */
  borderRadius: string;
  /** Border width (e.g. '1px', '0px', '2px') */
  borderWidth: string;
  /** Box shadow */
  shadow: string;
  /** Hover effect — applied as CSS transform or additional shadow */
  hoverEffect: string;

  // ── Surface DNA extensions ─────────────────────────────────────────────────

  /** Glassmorphism intensity (0 = opaque, 1 = full frosted glass) */
  glassmorphism: number;
  /** Backdrop blur amount (e.g. '0px', '12px', '24px') */
  backdropBlur: string;
  /** Elevation model — controls shadow depth strategy */
  elevationModel: ElevationModel;
  /** Border treatment style */
  borderStyle: BorderStyle;
  /** Whether to render inner-edge glass highlight */
  innerGlow: boolean;
  /** Surface texture overlay */
  surfaceTexture: SurfaceTexture;

  // ── Theme Morphing extensions ──────────────────────────────────────────────

  /** Primary surface rendering mode — controls entire card visual structure */
  surfaceMode: SurfaceMode;
  /** CRT/terminal scanline overlay effect */
  scanlineEffect: boolean;
  /** Paper-like warm texture for editorial themes */
  paperTexture: boolean;
}

// ─── Chart DNA ───────────────────────────────────────────────────────────────

export type GridlineStyle = 'none' | 'dashed' | 'solid' | 'dotted';
export type TooltipStyle = 'glass' | 'solid' | 'minimal' | 'bordered';
export type LegendPlacement = 'bottom' | 'right' | 'inline' | 'none';
export type DotStyle = 'none' | 'circle' | 'square' | 'diamond';
export type AxisDensity = 'minimal' | 'standard' | 'dense';
export type ChartLabelStyle = 'hidden' | 'minimal' | 'verbose';

export interface ThemeChartStyle {
  /** Opacity for chart grid lines (0–1) */
  gridOpacity: number;
  /** Stroke width for line charts */
  lineThickness: number;
  /** Stroke width for axis lines */
  axisThickness: number;
  /** Border radius for bar tops (px) */
  barRadius: number;
  /** Backdrop filter blur for tooltips (e.g. '8px') */
  tooltipBlur: string;
  /**
   * Per-chart-type accent overrides.
   * Provides backward compatibility with the explainability/debug system.
   * Falls back to chartPalette slices if not provided.
   */
  chartAccents: {
    bar: string;
    pie: string;
    line: string;
  };

  // ── Chart DNA extensions ───────────────────────────────────────────────────

  /** Whether axis lines are visible */
  axisVisible: boolean;
  /** Gridline rendering style */
  gridlineStyle: GridlineStyle;
  /** Tooltip visual treatment */
  tooltipStyle: TooltipStyle;
  /** Where chart legends are positioned */
  legendPlacement: LegendPlacement;
  /** Gradient fill intensity for bars/areas (0 = flat fill, 1 = strong gradient) */
  gradientIntensity: number;
  /** Dot rendering style on line charts */
  dotStyle: DotStyle;
  /** Area fill opacity for area/line charts (0 = no fill, 1 = solid fill) */
  areaOpacity: number;
  /** Chart entry animation duration in ms */
  animationDuration: number;

  // ── Theme Morphing extensions ──────────────────────────────────────────────

  /** Neon/glow intensity on chart strokes and elements (0 = none, 1 = full neon) */
  glowIntensity: number;
  /** How many axis ticks and labels to show */
  axisDensity: AxisDensity;
  /** How verbose chart text labels are */
  labelStyle: ChartLabelStyle;
}

// ─── Motion DNA ──────────────────────────────────────────────────────────────

export type HoverBehavior = 'none' | 'lift' | 'glow' | 'tilt' | 'scale';
export type SectionEntrance = 'none' | 'fade' | 'slide' | 'scale' | 'stagger';
export type MotionPreset = 'spring' | 'editorial-fade' | 'terminal-scan' | 'keynote-zoom' | 'none';

export interface ThemeMotion {
  /** CSS transition duration (e.g. '300ms', '0.3s') */
  transitionSpeed: string;
  /** Scale factor on hover (e.g. 1.02) */
  hoverScale: number;

  // ── Motion DNA extensions ──────────────────────────────────────────────────

  /** CSS easing function (e.g. 'cubic-bezier(0.16, 1, 0.3, 1)') */
  easing: string;
  /** Interactive hover behavior for cards */
  hoverBehavior: HoverBehavior;
  /** How sections/cards enter the viewport */
  sectionEntrance: SectionEntrance;
  /** Stagger delay between cards in ms */
  staggerDelay: number;
  /** Framer Motion spring stiffness */
  springStiffness: number;
  /** Framer Motion spring damping */
  springDamping: number;

  // ── Theme Morphing extensions ──────────────────────────────────────────────

  /** High-level motion personality preset — overrides individual motion params for coherent animation strategy */
  motionPreset: MotionPreset;
}

// ─── Meta Tokens ─────────────────────────────────────────────────────────────

export type ThemeAppearance = 'dark' | 'light';

export interface ThemeMeta {
  /** Human-readable theme name */
  themeName: string;
  /** Mood descriptors for explainability (e.g. ['dark', 'cyberpunk', 'neon']) */
  mood: string[];
  /** Light or dark appearance — drives CSS-level decisions */
  appearance: ThemeAppearance;
}

// ─── Composite Token Interface ───────────────────────────────────────────────

export interface ThemeTokens {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  cardStyle: ThemeCardStyle;
  chartStyle: ThemeChartStyle;
  motion: ThemeMotion;
  layout: ThemeLayoutDNA;
  meta: ThemeMeta;
}

// ─── Utility Types ───────────────────────────────────────────────────────────

/**
 * Deep partial variant of ThemeTokens.
 * Used as the input surface for:
 *   - LLM-generated theme fragments
 *   - resolveTheme() partial overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Shorthand for partial theme input */
export type PartialThemeTokens = DeepPartial<ThemeTokens>;
