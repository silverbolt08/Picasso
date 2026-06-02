// ─── Semantic → Theme Compiler (V2 — Theme DNA Engine) ──────────────────────
// THE VISUAL COMPILER.
//
// Input:  SemanticStyleProfile (LLM-generated, validated, normalized)
// Output: PartialThemeTokens  (passed to resolveTheme() → ThemeProvider)
//
// V2 produces full Theme DNA across all 5 strands:
//   1. Typography DNA — font families, scale, weight, transforms
//   2. Layout DNA     — density, whitespace, hero count, symmetry
//   3. Surface DNA    — radius, glass, shadow, borders, texture
//   4. Motion DNA     — easing, hover, entrance, springs
//   5. Chart DNA      — strokes, axes, gridlines, tooltips, legends
//
// Rules:
//   - Fully deterministic: same input ALWAYS produces same output
//   - No randomness, no external calls
//   - Pure functions only
//   - Every decision is traceable to a semantic dimension
// ─────────────────────────────────────────────────────────────────────────────

import type { SemanticStyleProfile } from './semanticTypes';
import type { SemanticCompilationResult, SemanticRationale } from './semanticTypes';
import type { PartialThemeTokens } from '../theme/themeTypes';

// ─── Math Utilities ──────────────────────────────────────────────────────────

/** Linearly interpolate between a and b using t in [0,1] */
function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}

/** Float lerp without rounding */
function lerpf(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Normalize a 0–100 dimension to 0–1 */
function n(dim: number): number {
  return dim / 100;
}

/** Convert HSL to hex string */
function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/** Convert HSL with alpha to hsla string */
function hsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a.toFixed(2)})`;
}

// ─── Color Compiler ──────────────────────────────────────────────────────────

interface AccentHSL { h: number; s: number; l: number }

// Hue center for each color family (mid-range of the family's hue band)
const COLOR_FAMILY_HUE: Record<string, number> = {
  green:   132,  // 120–145°
  cyan:    185,  // 175–200°
  blue:    225,  // 210–240°
  purple:  275,  // 260–290°
  pink:    315,  // 300–330°
  red:     5,    // 340–15°
  orange:  28,   // 20–40°
  gold:    46,   // 42–52°
  warm:    42,   // 30–55°
  neutral: -1,   // Sentinel: use dimension-based fallback
};

function deriveAccentHue(p: SemanticStyleProfile): number {
  // colorFamily takes ABSOLUTE priority when explicitly set
  const familyHue = COLOR_FAMILY_HUE[p.colorFamily];
  if (familyHue !== undefined && familyHue >= 0) {
    // Fine-tune within the family band using energy/expressiveness for variety
    const bandWidth = 15; // ±15° within family band
    const offset = (p.expressiveness / 100 - 0.5) * bandWidth;
    return ((familyHue + offset) + 360) % 360;
  }

  // Fallback: dimension-driven hue (only when colorFamily === 'neutral')
  const { futurism, luxury, playfulness, energy } = p;
  const dom = Math.max(futurism, luxury, playfulness, energy);
  if (dom === futurism && futurism > 60) return lerp(175, 200, n(futurism));
  if (dom === luxury && luxury > 55) return lerp(35, 48, n(luxury));
  if (dom === playfulness && playfulness > 55) return lerp(280, 320, n(playfulness));
  if (dom === energy && energy > 70) return lerp(0, 25, n(energy));
  return lerp(160, 180, n(p.professionalism)); // professional teal default
}


function deriveAccentSaturation(p: SemanticStyleProfile): number {
  const base = lerp(45, 95, n(p.expressiveness));
  const luxAdjust = p.luxury > 60 ? -15 : 0;
  const minAdjust = -lerp(0, 25, n(p.minimalism));
  return Math.max(25, Math.min(100, base + luxAdjust + minAdjust));
}

function deriveAccentLightness(p: SemanticStyleProfile, dark: boolean): number {
  if (dark) {
    const base = lerp(50, 70, n(p.energy));
    const glowBoost = lerp(0, 8, n(p.visualLanguage.glow));
    return Math.min(80, base + glowBoost);
  } else {
    return lerp(35, 52, n(p.expressiveness));
  }
}

function deriveChartPalette(accent: AccentHSL, p: SemanticStyleProfile): string[] {
  const spread = lerp(30, 180, n(p.expressiveness));
  const step = spread / 7;
  const sShift = p.visualLanguage.glow > 50 ? 10 : 0;
  const dark = p.appearance === 'dark';

  return Array.from({ length: 8 }, (_, i) => {
    const hue = (accent.h + i * step) % 360;
    const sat = Math.min(100, accent.s + (i % 2 === 0 ? 0 : sShift));
    const light = dark
      ? lerp(45, 70, n((i * 15) % 60 + 30))
      : lerp(35, 55, n((i * 15) % 60 + 30));
    return hsl(hue, sat, light);
  });
}

function compileColors(p: SemanticStyleProfile): PartialThemeTokens['colors'] {
  const dark = p.appearance === 'dark';
  const accentH = deriveAccentHue(p);
  const accentS = deriveAccentSaturation(p);
  const accentL = deriveAccentLightness(p, dark);
  const accent: AccentHSL = { h: accentH, s: accentS, l: accentL };

  let bgL: number, surfL: number, cardL: number;
  if (dark) {
    bgL = lerp(4, 12, n(100 - p.futurism));
    bgL = p.luxury > 60 ? Math.max(bgL - 2, 3) : bgL;
    surfL = bgL + lerp(2, 6, n(p.luxury));
    cardL = surfL + lerp(2, 5, n(100 - p.minimalism));
  } else {
    bgL = lerp(96.5, 98.5, n(100 - p.density));
    surfL = bgL - 2.5;
    cardL = 100;
  }

  const bgSat = dark 
    ? lerp(0, 15, n(p.futurism * 0.5)) 
    : (p.minimalism > 60 ? lerp(1, 4, n(p.expressiveness)) : lerp(4, 8, n(p.expressiveness)));
  const bgHue = dark ? (accentH + 210) % 360 : accentH;

  const glassAlpha = n(p.visualLanguage.transparency);

  const background = hsl(bgHue, bgSat, bgL);

  const surface = p.visualLanguage.transparency > 40 && dark
    ? hsla(accentH, 15, surfL + 5, 0.04 + glassAlpha * 0.08)
    : hsl(bgHue, bgSat, surfL);

  const cardBackground = dark
    ? (p.visualLanguage.transparency > 40
        ? hsla(accentH, 15, cardL + 5, 0.06 + glassAlpha * 0.1)
        : hsl(bgHue, bgSat, cardL))
    : (p.visualLanguage.transparency > 40 
        ? `rgba(255, 255, 255, ${(0.92 - glassAlpha * 0.1).toFixed(2)})` 
        : '#ffffff');

  const borderStrengthAlpha = 0.04 + n(p.geometry.borderStrength) * 0.4;
  const border = dark
    ? hsla(accentH, accentS * 0.5, 80, borderStrengthAlpha)
    : hsla(accentH, 8, 20, 0.04 + n(p.geometry.borderStrength) * 0.12);

  const divider = dark
    ? hsla(0, 0, 100, borderStrengthAlpha * 0.5)
    : hsla(accentH, 8, 20, 0.02 + n(p.geometry.borderStrength) * 0.06);

  const textPrimary = dark 
    ? hsl(0, 0, lerp(80, 98, n(p.minimalism))) 
    : hsl(accentH, 12, lerp(12, 18, n(100 - p.minimalism)));
  const textSecondary = dark 
    ? hsl(accentH, 10, lerp(45, 65, n(100 - p.density))) 
    : hsl(accentH, 8, lerp(36, 44, n(100 - p.density)));
  const textMuted = dark 
    ? hsl(accentH, 8, lerp(30, 45, n(100 - p.density))) 
    : hsl(accentH, 6, lerp(52, 60, n(100 - p.density)));

  const accentPrimary = hsl(accentH, accentS, accentL);
  const secondaryH = (accentH + 40) % 360;
  const accentSecondary = hsl(secondaryH, accentS - 5, accentL - 5);

  const success = hsl(145, 65, dark ? 58 : 40);
  const warning = hsl(38, 90, dark ? 60 : 45);
  const danger = hsl(355, 75, dark ? 62 : 50);

  const grid = dark
    ? hsla(accentH, 30, 80, 0.03 + n(p.geometry.sharpness) * 0.08)
    : hsla(accentH, 8, 20, 0.03 + n(p.geometry.sharpness) * 0.05);

  const tooltipBg = dark
    ? hsla(bgHue, bgSat * 2, cardL, p.visualLanguage.transparency > 40 ? 0.85 : 1)
    : 'rgba(255, 255, 255, 0.94)';
  const tooltipBorder = dark
    ? hsla(accentH, accentS * 0.4, 70, 0.15)
    : hsla(accentH, 8, 20, 0.06);

  const chartPalette = deriveChartPalette(accent, p);

  return {
    background,
    surface: String(surface),
    surfaceSecondary: String(surface),
    cardBackground: String(cardBackground),
    border: String(border),
    divider: String(divider),
    textPrimary,
    textSecondary,
    textMuted,
    accentPrimary,
    accentSecondary,
    success,
    warning,
    danger,
    grid: String(grid),
    tooltipBackground: String(tooltipBg),
    tooltipBorder: String(tooltipBorder),
    chartPalette,
  };
}

// ─── Typography DNA Compiler ─────────────────────────────────────────────────

const FONT_MAP: Record<string, { heading: string; body: string; display: string; mono: string }> = {
  modern:    { heading: '"Inter Tight", sans-serif',      body: '"DM Sans", sans-serif',       display: 'Syne, sans-serif',                 mono: '"Space Grotesk", monospace' },
  technical: { heading: '"Space Grotesk", monospace',     body: '"IBM Plex Mono", monospace',   display: '"JetBrains Mono", monospace',       mono: '"JetBrains Mono", monospace' },
  retro:     { heading: 'Syne, sans-serif',               body: '"DM Sans", sans-serif',       display: '"Archivo Black", sans-serif',       mono: '"Space Grotesk", monospace' },
  editorial: { heading: '"Playfair Display", serif',      body: '"DM Sans", sans-serif',       display: '"Cormorant Garofani", serif',       mono: '"Space Grotesk", monospace' },
  playful:   { heading: 'Nunito, sans-serif',             body: 'Nunito, sans-serif',          display: 'Nunito, sans-serif',                mono: '"Space Grotesk", monospace' },
};

function compileTypography(p: SemanticStyleProfile): PartialThemeTokens['typography'] {
  const fonts = FONT_MAP[p.typography.style] ?? FONT_MAP.modern;
  const weightMap: Record<string, number> = { light: 300, medium: 500, bold: 700 };
  const headingWeight = p.typography.weight === 'bold' ? 800 : weightMap[p.typography.weight] ?? 600;
  const bodyWeight = p.typography.weight === 'light' ? 300 : 400;

  // Density affects sizing — compact = smaller
  const baseSize = lerpf(0.8125, 1.125, n(100 - p.density));
  const titleSize = `${(baseSize).toFixed(4)}rem`;
  const bodySize = `${(baseSize * 0.875).toFixed(4)}rem`;
  const captionSize = `${(baseSize * 0.6875).toFixed(4)}rem`;

  // Font scale: luxury → larger, density → smaller, expressiveness → larger
  const fontScale = lerpf(0.85, 1.2, n(
    p.luxury * 0.4 + (100 - p.density) * 0.3 + p.expressiveness * 0.3
  ));

  // Heading transform: military/technical at high professionalism → uppercase
  // Editorial → none, Playful → none
  let headingTransform: 'none' | 'uppercase' | 'small-caps' = 'none';
  if (p.typography.style === 'technical' && p.professionalism > 70) {
    headingTransform = 'uppercase';
  } else if (p.professionalism > 85 && p.density > 60) {
    headingTransform = 'uppercase';
  }

  // Heading letter spacing: technical/uppercase → wide, editorial → tight
  let headingLetterSpacing: string;
  if (headingTransform === 'uppercase') {
    headingLetterSpacing = `${lerpf(0.04, 0.12, n(p.professionalism)).toFixed(3)}em`;
  } else if (p.typography.style === 'editorial') {
    headingLetterSpacing = `${lerpf(-0.03, -0.01, n(p.luxury)).toFixed(3)}em`;
  } else {
    headingLetterSpacing = `${lerpf(-0.02, 0.01, n(p.minimalism)).toFixed(3)}em`;
  }

  // Metadata font: technical → mono, otherwise body
  const metadataFont = p.typography.style === 'technical' ? fonts.mono : fonts.body;

  // Metadata transform: almost always uppercase for dashboards
  const metadataTransform: 'none' | 'uppercase' = p.playfulness > 70 ? 'none' : 'uppercase';

  return {
    headingFont: fonts.heading,
    bodyFont: fonts.body,
    displayFont: fonts.display,
    monoFont: fonts.mono,
    metadataFont,
    titleSize,
    bodySize,
    captionSize,
    fontWeightHeading: headingWeight,
    fontWeightBody: bodyWeight,
    fontScale: Number(fontScale.toFixed(3)),
    headingTransform,
    headingLetterSpacing,
    metadataTransform,
  };
}

// ─── Layout DNA Compiler ─────────────────────────────────────────────────────

function compileLayoutDNA(p: SemanticStyleProfile): PartialThemeTokens['layout'] {
  // Density level from the density dimension
  let densityLevel: 'airy' | 'comfortable' | 'compact' | 'dense';
  if (p.density < 25) densityLevel = 'airy';
  else if (p.density < 50) densityLevel = 'comfortable';
  else if (p.density < 75) densityLevel = 'compact';
  else densityLevel = 'dense';

  // Whitespace scale: luxury → generous, density → tight
  const whitespaceScale = lerpf(0.6, 1.8, n(
    p.luxury * 0.5 + (100 - p.density) * 0.3 + p.minimalism * 0.2
  ));

  // Preferred hero count: editorial/luxury → more heroes, dense → fewer
  let preferredHeroCount = 1;
  if (p.density > 70) preferredHeroCount = 0;
  else if (p.luxury > 60 || p.expressiveness > 70) preferredHeroCount = 2;

  // Grid symmetry: editorial/asymmetric design feels → asymmetric
  const gridSymmetry: 'symmetric' | 'asymmetric' = 
    (p.typography.style === 'editorial' || (p.expressiveness > 65 && p.minimalism < 50))
      ? 'asymmetric' 
      : 'symmetric';

  // Max content width: dense → wider, luxury → narrower (more focused)
  let maxContentWidth: string;
  if (p.density > 70) maxContentWidth = '1920px';
  else if (p.luxury > 60) maxContentWidth = '1440px';
  else maxContentWidth = '1680px';

  return {
    densityLevel,
    whitespaceScale: Number(whitespaceScale.toFixed(3)),
    preferredHeroCount,
    gridSymmetry,
    maxContentWidth,
  };
}

// ─── Spacing Compiler ────────────────────────────────────────────────────────

function compileSpacing(p: SemanticStyleProfile): PartialThemeTokens['spacing'] {
  let spacingMult = 1 + n(p.luxury) * 0.5 - n(p.density) * 0.4 + n(p.minimalism) * 0.2;
  if (p.appearance === 'light') {
    spacingMult *= 1.15; // Editorial breathing room
  }
  const base = Math.max(0.75, Math.min(2.5, 1.25 * spacingMult));

  return {
    pagePadding: `${(base * 1.6).toFixed(2)}rem`,
    sectionGap: `${(base * 1.2).toFixed(2)}rem`,
    cardPadding: `${(base).toFixed(2)}rem`,
    gridGap: `${(base * 1.2).toFixed(2)}rem`,
  };
}

// ─── Surface DNA Compiler (Card Style) ───────────────────────────────────────

function compileCardStyle(p: SemanticStyleProfile): PartialThemeTokens['cardStyle'] {
  const dark = p.appearance === 'dark';

  // Roundness: 0 → 0px, 100 → 1.5rem
  const radiusPx = lerp(0, 24, n(p.geometry.roundness));
  const borderRadius = radiusPx === 0 ? '0px' : `${(radiusPx / 16).toFixed(3)}rem`;

  // Border width from border style
  const borderWidthPx = p.geometry.borderStrength < 10 ? 0 : p.geometry.borderStrength < 40 ? 1 : 2;
  const borderWidth = `${borderWidthPx}px`;

  // Shadow with elevation model logic
  let shadow = 'none';
  if (!dark) {
    const blur = lerp(8, 48, n(p.visualLanguage.layering || 30));
    const opacity = lerpf(0.02, 0.08, n((p.luxury || 30) + (p.visualLanguage.layering || 30)) / 2);
    const yOffset = lerp(1, 8, n(p.visualLanguage.layering || 30));
    shadow = `0 1px 3px rgba(15, 23, 42, 0.01), 0 ${yOffset}px ${blur}px rgba(15, 23, 42, ${opacity.toFixed(3)}), inset 0 1px 0 rgba(255, 255, 255, 0.9)`;
    if (p.visualLanguage.glow > 50) {
      const accentH = deriveAccentHue(p);
      shadow += `, 0 0 ${lerp(12, 30, n(p.visualLanguage.glow))}px ${hsla(accentH, 80, 50, 0.03)}`;
    }
  } else if (p.visualLanguage.glow > 50) {
    const accentH = deriveAccentHue(p);
    const glowSpread = lerp(10, 40, n(p.visualLanguage.glow));
    const glowAlpha = (n(p.visualLanguage.glow) * 0.3).toFixed(2);
    shadow = `0 0 ${glowSpread}px ${hsla(accentH, 80, 60, Number(glowAlpha))}`;
  } else if (p.luxury > 40 || p.visualLanguage.layering > 40) {
    const blur = lerp(8, 48, n(p.visualLanguage.layering));
    const opacity = lerpf(0.1, 0.4, n(p.luxury + p.visualLanguage.layering) / 2);
    if (dark) {
      shadow = `0 ${lerp(2, 12, n(p.visualLanguage.layering))}px ${blur}px rgba(0,0,0,${opacity.toFixed(2)})`;
      if (p.visualLanguage.transparency > 40) {
        shadow += `, inset 0 1px 0 rgba(255,255,255,0.05)`;
      }
    } else {
      shadow = `0 ${lerp(1, 8, n(p.visualLanguage.layering))}px ${blur}px rgba(0,0,0,${(opacity * 0.5).toFixed(2)})`;
    }
  }

  const hoverEffect = p.motion.intensity < 10 
    ? 'none' 
    : (dark 
        ? shadow 
        : `0 2px 6px rgba(15, 23, 42, 0.01), 0 ${lerp(4, 16, n(p.visualLanguage.layering || 30))}px ${lerp(12, 60, n(p.visualLanguage.layering || 30))}px rgba(15, 23, 42, ${(lerpf(0.04, 0.14, n((p.luxury || 30) + (p.visualLanguage.layering || 30)) / 2)).toFixed(3)}), inset 0 1px 0 rgba(255, 255, 255, 0.9)`);

  // ── Surface DNA extensions ─────────────────────────────────────────────────

  // Glassmorphism: transparency dimension controls this
  const glassmorphism = lerpf(0, 1, n(p.visualLanguage.transparency));

  // Backdrop blur: scales with transparency
  const blurPx = p.visualLanguage.transparency < 20 ? 0 : lerp(8, 24, n(p.visualLanguage.transparency));
  const backdropBlur = `${blurPx}px`;

  // Elevation model
  let elevationModel: 'flat' | 'subtle' | 'layered' | 'deep';
  const layeringScore = p.visualLanguage.layering + p.luxury * 0.3;
  if (layeringScore < 20) elevationModel = 'flat';
  else if (layeringScore < 45) elevationModel = 'subtle';
  else if (layeringScore < 70) elevationModel = 'layered';
  else elevationModel = 'deep';

  // Border style
  let borderStyle: 'none' | 'hairline' | 'solid' | 'heavy';
  if (p.geometry.borderStrength < 10) borderStyle = 'none';
  else if (p.geometry.borderStrength < 35) borderStyle = 'hairline';
  else if (p.geometry.borderStrength < 70) borderStyle = 'solid';
  else borderStyle = 'heavy';

  // Inner glow: present with glass/transparency or luxury
  const innerGlow = p.visualLanguage.transparency > 30 || p.luxury > 50;

  // Surface texture
  let surfaceTexture: 'clean' | 'noise' | 'grain';
  if (p.visualLanguage.noise > 60) surfaceTexture = 'grain';
  else if (p.visualLanguage.noise > 30) surfaceTexture = 'noise';
  else surfaceTexture = 'clean';

  return {
    borderRadius, borderWidth, shadow, hoverEffect,
    glassmorphism: Number(glassmorphism.toFixed(3)),
    backdropBlur,
    elevationModel,
    borderStyle,
    innerGlow,
    surfaceTexture,
  };
}

// ─── Chart DNA Compiler ──────────────────────────────────────────────────────

function compileChartStyle(p: SemanticStyleProfile, accentH: number, accentS: number, accentL: number): PartialThemeTokens['chartStyle'] {
  const dark = p.appearance === 'dark';

  const gridOpacity = lerpf(0.01, 0.12, n(p.geometry.sharpness));
  const lineThickness = lerp(1, 4, n(p.expressiveness));
  const barRadius = p.geometry.roundness < 10 ? 0 : lerp(2, 12, n(p.geometry.roundness));
  const tooltipBlur = p.visualLanguage.transparency < 20 ? '0px' : `${lerp(4, 24, n(p.visualLanguage.transparency))}px`;

  // Per-type accents
  const barAccent = hsl(accentH, accentS, accentL);
  const pieAccent = hsl((accentH + 30) % 360, accentS, dark ? accentL - 5 : accentL + 5);
  const lineAccent = hsl((accentH + 60) % 360, accentS, accentL);

  // ── Chart DNA extensions ───────────────────────────────────────────────────

  // Axis visibility: high sharpness/professionalism → visible
  const axisVisible = p.geometry.sharpness > 40 || p.professionalism > 80;

  // Gridline style
  let gridlineStyle: 'none' | 'dashed' | 'solid' | 'dotted';
  if (p.geometry.sharpness < 15) gridlineStyle = 'none';
  else if (p.professionalism > 75 && p.geometry.sharpness > 50) gridlineStyle = 'solid';
  else if (p.minimalism > 60) gridlineStyle = 'dotted';
  else gridlineStyle = 'dashed';

  // Tooltip style
  let tooltipStyle: 'glass' | 'solid' | 'minimal' | 'bordered';
  if (p.visualLanguage.transparency > 50) tooltipStyle = 'glass';
  else if (p.minimalism > 70) tooltipStyle = 'minimal';
  else if (p.geometry.borderStrength > 50) tooltipStyle = 'bordered';
  else tooltipStyle = 'solid';

  // Legend placement
  let legendPlacement: 'bottom' | 'right' | 'inline' | 'none';
  if (p.minimalism > 75) legendPlacement = 'none';
  else if (p.density > 65) legendPlacement = 'inline';
  else if (p.typography.style === 'editorial') legendPlacement = 'right';
  else legendPlacement = 'bottom';

  // Gradient intensity: expressiveness drives it, minimalism dampens
  const gradientIntensity = lerpf(0.1, 0.9, n(
    p.expressiveness * 0.6 + (100 - p.minimalism) * 0.4
  ));

  // Dot style
  let dotStyle: 'none' | 'circle' | 'square' | 'diamond';
  if (p.minimalism > 75) dotStyle = 'none';
  else if (p.geometry.roundness < 20) dotStyle = 'square';
  else if (p.expressiveness > 70) dotStyle = 'diamond';
  else dotStyle = 'circle';

  // Area opacity: expressiveness/energy → more fill, minimalism → less
  const areaOpacity = lerpf(0.02, 0.35, n(
    p.energy * 0.4 + p.expressiveness * 0.3 + (100 - p.minimalism) * 0.3
  ));

  // Animation duration: high motion → longer, none → instant
  const animationDuration = p.motion.intensity < 10 ? 0 : lerp(400, 1500, n(p.motion.intensity));

  return {
    gridOpacity: Number(gridOpacity.toFixed(3)),
    lineThickness,
    axisThickness: p.geometry.borderStrength < 30 ? 0 : 1,
    barRadius,
    tooltipBlur,
    chartAccents: { bar: barAccent, pie: pieAccent, line: lineAccent },
    axisVisible,
    gridlineStyle,
    tooltipStyle,
    legendPlacement,
    gradientIntensity: Number(gradientIntensity.toFixed(3)),
    dotStyle,
    areaOpacity: Number(areaOpacity.toFixed(3)),
    animationDuration,
  };
}

// ─── Motion DNA Compiler ─────────────────────────────────────────────────────

function compileMotion(p: SemanticStyleProfile): PartialThemeTokens['motion'] {
  if (p.motion.intensity === 0) {
    return {
      transitionSpeed: '0ms',
      hoverScale: 1,
      easing: 'linear',
      hoverBehavior: 'none',
      sectionEntrance: 'none',
      staggerDelay: 0,
      springStiffness: 300,
      springDamping: 30,
    };
  }

  // Duration
  const baseMs = lerp(80, 500, n(p.motion.intensity));
  const smoothnessMult = 1 + n(p.motion.smoothness) * 0.4;
  const ms = Math.round(baseMs * smoothnessMult);
  const hoverScale = 1 + n(p.motion.intensity) * 0.03;

  // Easing: smoothness drives organic vs mechanical feel
  let easing: string;
  if (p.motion.smoothness > 70) {
    easing = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Smooth spring
  } else if (p.motion.smoothness > 40) {
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)';  // Material standard
  } else {
    easing = 'cubic-bezier(0.25, 1, 0.5, 1)';  // Kinetic snap
  }

  // Hover behavior: determined by combination of luxury, softness, energy
  let hoverBehavior: 'none' | 'lift' | 'glow' | 'tilt' | 'scale';
  if (p.motion.intensity < 15) {
    hoverBehavior = 'none';
  } else if (p.luxury > 60 && p.visualLanguage.layering > 40) {
    hoverBehavior = 'tilt'; // Luxury 3D perspective
  } else if (p.visualLanguage.glow > 50) {
    hoverBehavior = 'glow'; // Neon hover glow
  } else if (p.softness > 60) {
    hoverBehavior = 'lift'; // Gentle elevation
  } else {
    hoverBehavior = 'scale'; // Simple scale-up
  }

  // Section entrance
  let sectionEntrance: 'none' | 'fade' | 'slide' | 'scale' | 'stagger';
  if (p.motion.intensity < 15) {
    sectionEntrance = 'none';
  } else if (p.motion.intensity > 70) {
    sectionEntrance = 'stagger'; // High energy → staggered reveal
  } else if (p.motion.smoothness > 60) {
    sectionEntrance = 'slide'; // Smooth slide-up
  } else if (p.expressiveness > 60) {
    sectionEntrance = 'scale'; // Expressive scale-in
  } else {
    sectionEntrance = 'fade'; // Subtle fade
  }

  // Stagger delay
  const staggerDelay = lerp(40, 150, n(p.motion.smoothness));

  // Spring config: smoothness → lower stiffness/higher damping (fluid)
  // Low smoothness → higher stiffness/lower damping (snappy)
  const springStiffness = lerp(300, 120, n(p.motion.smoothness));
  const springDamping = lerp(18, 30, n(p.motion.smoothness));

  return {
    transitionSpeed: `${ms}ms`,
    hoverScale: Number(hoverScale.toFixed(3)),
    easing,
    hoverBehavior,
    sectionEntrance,
    staggerDelay,
    springStiffness,
    springDamping,
  };
}

// ─── Main Compiler ───────────────────────────────────────────────────────────

/**
 * Deterministically compile a SemanticStyleProfile into PartialThemeTokens.
 *
 * V2 — produces full Theme DNA across all 5 strands.
 * Same input → always same output.
 * No randomness. No external calls.
 */
export function semanticToTheme(profile: SemanticStyleProfile): SemanticCompilationResult {
  const accentH = deriveAccentHue(profile);
  const accentS = deriveAccentSaturation(profile);
  const accentL = deriveAccentLightness(profile, profile.appearance === 'dark');

  const colors = compileColors(profile);
  const typography = compileTypography(profile);
  const spacing = compileSpacing(profile);
  const layout = compileLayoutDNA(profile);
  const cardStyle = compileCardStyle(profile);
  const chartStyle = compileChartStyle(profile, accentH, accentS, accentL);
  const motion = compileMotion(profile);

  const tokens: PartialThemeTokens = {
    colors,
    typography,
    spacing,
    layout,
    cardStyle,
    chartStyle,
    motion,
    meta: {
      themeName: profile.mood.slice(0, 2).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' '),
      mood: profile.mood,
      appearance: profile.appearance,
    },
  };

  // Build rationale
  const rationale: SemanticRationale = {
    appearance: `${profile.appearance === 'dark' ? 'Dark' : 'Light'} base selected from appearance field.`,
    colors: `Accent hue ${Math.round(accentH)}° derived from colorFamily: '${profile.colorFamily}'. Saturation ${Math.round(accentS)}% from expressiveness (${profile.expressiveness}).`,
    palette: `8-color palette spanning ${Math.round(30 + n(profile.expressiveness) * 150)}° of hue wheel. Spread driven by expressiveness (${profile.expressiveness}).`,
    typography: `${profile.typography.style} style → ${FONT_MAP[profile.typography.style]?.heading ?? 'Inter Tight'}. Weight: ${profile.typography.weight}. Scale: ${(typography as { fontScale?: number }).fontScale ?? 1}. Transform: ${(typography as { headingTransform?: string }).headingTransform ?? 'none'}.`,
    spacing: `${profile.luxury > 60 ? 'Generous' : profile.density > 60 ? 'Compact' : 'Standard'} spacing. Layout: ${(layout as { densityLevel?: string }).densityLevel ?? 'comfortable'}. Whitespace: ${(layout as { whitespaceScale?: number }).whitespaceScale ?? 1}x.`,
    cardGeometry: `Border radius: ${(cardStyle as {borderRadius: string}).borderRadius} from roundness (${profile.geometry.roundness}). Elevation: ${(cardStyle as {elevationModel?: string}).elevationModel ?? 'layered'}. Glass: ${((cardStyle as {glassmorphism?: number}).glassmorphism ?? 0).toFixed(2)}.`,
    shadow: `${profile.visualLanguage.glow > 50 ? 'Glow shadow' : profile.luxury > 40 ? 'Depth shadow' : 'No shadow'} from glow (${profile.visualLanguage.glow}) + layering (${profile.visualLanguage.layering}) + luxury (${profile.luxury}).`,
    motion: `${(motion as {transitionSpeed: string}).transitionSpeed} transition. Hover: ${(motion as {hoverBehavior?: string}).hoverBehavior ?? 'tilt'}. Entrance: ${(motion as {sectionEntrance?: string}).sectionEntrance ?? 'slide'}. Spring: ${(motion as {springStiffness?: number}).springStiffness ?? 180}/${(motion as {springDamping?: number}).springDamping ?? 24}.`,
    chartStyle: `Grid: ${(chartStyle as {gridlineStyle?: string}).gridlineStyle ?? 'dashed'} @ ${((chartStyle as {gridOpacity: number}).gridOpacity).toFixed(3)}. Dots: ${(chartStyle as {dotStyle?: string}).dotStyle ?? 'circle'}. Legend: ${(chartStyle as {legendPlacement?: string}).legendPlacement ?? 'bottom'}. Gradient: ${((chartStyle as {gradientIntensity?: number}).gradientIntensity ?? 0.5).toFixed(2)}.`,
  };

  return { tokens, rationale };
}
