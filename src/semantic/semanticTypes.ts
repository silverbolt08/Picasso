// ─── Semantic Style Profile ───────────────────────────────────────────────────
// The semantic schema is the ONLY output the LLM produces.
// It describes aesthetic INTENT, not visual values.
//
// The deterministic compiler (semanticToTheme.ts) translates this into tokens.
//
// Pipeline:
//   Natural Language → LLM → SemanticStyleProfile → semanticToTheme() → ThemeTokens
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A normalized 0–100 scale value.
 * 0 = none/minimal, 100 = maximum/extreme.
 */
export type SemanticDimension = number;

/**
 * Aesthetic mood tags (open vocabulary — LLM-generated).
 * Examples: "neon", "brutalist", "frosted", "corporate", "playful"
 */
export type MoodTag = string;

/**
 * Typography style category.
 * Determines font family selection in the compiler.
 */
export type TypographyStyle =
  | 'modern'      // Clean geometric sans (DM Sans)
  | 'technical'   // Monospace-influenced (Space Grotesk)
  | 'retro'       // Slab/display (Syne)
  | 'editorial'   // High-contrast serif-influenced (Playfair Display)
  | 'playful';    // Rounded, friendly (Nunito)

/**
 * Typography weight preference.
 */
export type TypographyWeight = 'light' | 'medium' | 'bold';

/**
 * Appearance mode.
 */
export type SemanticAppearance = 'light' | 'dark';

/**
 * Named color family intent — semantic intent, never a raw hex/color value.
 * The LLM picks the family name; the compiler maps it to hue ranges.
 *
 * green   → hue 120–145° (terminal, nature, ecological, success)
 * cyan    → hue 175–200° (futuristic, sci-fi, tech, neon-blue)
 * blue    → hue 210–240° (corporate, calm, trust, deep)
 * purple  → hue 260–290° (creative, mystical, luxury-dark)
 * pink    → hue 300–330° (playful, vibrant, retro-pop, neon-pink)
 * red     → hue 340–15°  (power, danger, energy, bold)
 * orange  → hue 20–40°   (warm, retro, energetic)
 * gold    → hue 42–52°   (luxury, premium, financial, opulent)
 * warm    → hue 30–55°   (general earthy/warm — less specific than gold)
 * neutral → desaturated/teal, driven entirely by other dimensions
 */
export type ColorFamily =
  | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
  | 'red' | 'orange' | 'gold' | 'warm' | 'neutral';

// ─── Core Schema ─────────────────────────────────────────────────────────────


export interface SemanticStyleProfile {
  /**
   * Light or dark base appearance.
   * The compiler uses this to determine background lightness.
   */
  appearance: SemanticAppearance;

  /**
   * Open-vocabulary mood descriptors.
   * Used for meta.mood[] and explainability logging.
   */
  mood: MoodTag[];

  /**
   * Named color family intent.
   * Use when the prompt explicitly requests a color — do NOT generate hex values.
   * Examples: "green terminal" → 'green', "gold luxury" → 'gold', "neon cyan" → 'cyan'
   * Default to 'neutral' if no clear color preference is expressed.
   */
  colorFamily: ColorFamily;

  // ── Emotional Dimensions ──────────────────────────────────────────────────

  /** 0=calm/subdued, 100=intense/vibrant */
  energy: SemanticDimension;

  /** 0=harsh/geometric, 100=soft/rounded */
  softness: SemanticDimension;

  /** 0=airy/spacious, 100=compact/dense */
  density: SemanticDimension;

  /** 0=traditional/familiar, 100=alien/futuristic */
  futurism: SemanticDimension;

  /** 0=utilitarian, 100=opulent/premium */
  luxury: SemanticDimension;

  /** 0=casual, 100=corporate/institutional */
  professionalism: SemanticDimension;

  /** 0=serious, 100=whimsical/fun */
  playfulness: SemanticDimension;

  /** 0=maximalist, 100=zen/stripped */
  minimalism: SemanticDimension;

  /** 0=restrained, 100=bold/loud */
  expressiveness: SemanticDimension;

  // ── Geometry ─────────────────────────────────────────────────────────────

  geometry: {
    /** 0=sharp corners, 100=fully pill-shaped */
    roundness: SemanticDimension;

    /** 0=no structure, 100=heavy grid lines */
    sharpness: SemanticDimension;

    /** 0=invisible borders, 100=bold visible borders */
    borderStrength: SemanticDimension;
  };

  // ── Motion ───────────────────────────────────────────────────────────────

  motion: {
    /** 0=static/instant, 100=animated/kinetic */
    intensity: SemanticDimension;

    /** 0=snappy/mechanical, 100=fluid/organic */
    smoothness: SemanticDimension;
  };

  // ── Typography ───────────────────────────────────────────────────────────

  typography: {
    /** Font personality category */
    style: TypographyStyle;

    /** Font weight preference */
    weight: TypographyWeight;
  };

  // ── Visual Language ──────────────────────────────────────────────────────

  visualLanguage: {
    /** 0=no glow, 100=strong neon glow effects */
    glow: SemanticDimension;

    /** 0=opaque surfaces, 100=frosted glass/transparency */
    transparency: SemanticDimension;

    /** 0=flat, 100=deep layered depth */
    layering: SemanticDimension;

    /** 0=clean/digital, 100=organic texture/noise */
    noise: SemanticDimension;
  };
}

// ─── Compiler Output ─────────────────────────────────────────────────────────

/**
 * The result of running semanticToTheme().
 * Includes both the tokens and a human-readable rationale for each decision.
 */
export interface SemanticCompilationResult {
  /** The resolved partial theme tokens */
  tokens: import('../theme/themeTypes').PartialThemeTokens;

  /** Human-readable explanation of every visual decision */
  rationale: SemanticRationale;
}

export interface SemanticRationale {
  appearance: string;
  colors: string;
  palette: string;
  typography: string;
  spacing: string;
  cardGeometry: string;
  shadow: string;
  motion: string;
  chartStyle: string;
}
