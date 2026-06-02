// ─── Semantic Extractor ───────────────────────────────────────────────────────
// THE ONLY AI CALL IN THE SYSTEM.
//
// Input:  Natural language aesthetic prompt (e.g. "cyberpunk trading terminal")
// Output: Validated SemanticStyleProfile
//
// The LLM ONLY interprets semantics.
// It NEVER generates CSS, tokens, or colors.
//
// Pipeline:
//   userPrompt → structured system prompt → Gemini → raw JSON → validate → SemanticStyleProfile
// ─────────────────────────────────────────────────────────────────────────────

import { getGeminiClient, getGeminiModelName } from './geminiClient';
import { validateSemanticProfile, type SemanticValidationResult } from '../semantic/semanticValidator';
import { defaultSemanticProfile } from '../semantic/semanticDefaults';

// ─── System Prompt ────────────────────────────────────────────────────────────
// This is what the LLM receives. It STRICTLY constrains the LLM to only
// produce a SemanticStyleProfile — nothing else.

const SYSTEM_PROMPT = `You are a visual aesthetics analyzer. Your ONLY job is to interpret a natural language aesthetic description and output a SemanticStyleProfile JSON object.

CRITICAL RULES:
- Output ONLY valid JSON. No markdown, no explanation, no code blocks.
- Do NOT generate colors, CSS, hex values, font names, or any visual tokens.
- ONLY output the semantic intent dimensions.
- All numeric values must be integers between 0 and 100.

OUTPUT SCHEMA (output EXACTLY this structure):
{
  "appearance": "dark" | "light",
  "mood": ["tag1", "tag2", ...],
  "colorFamily": "green" | "cyan" | "blue" | "purple" | "pink" | "red" | "orange" | "gold" | "warm" | "neutral",
  "energy": 0-100,
  "softness": 0-100,
  "density": 0-100,
  "futurism": 0-100,
  "luxury": 0-100,
  "professionalism": 0-100,
  "playfulness": 0-100,
  "minimalism": 0-100,
  "expressiveness": 0-100,
  "geometry": {
    "roundness": 0-100,
    "sharpness": 0-100,
    "borderStrength": 0-100
  },
  "motion": {
    "intensity": 0-100,
    "smoothness": 0-100
  },
  "typography": {
    "style": "modern" | "technical" | "retro" | "editorial" | "playful",
    "weight": "light" | "medium" | "bold"
  },
  "visualLanguage": {
    "glow": 0-100,
    "transparency": 0-100,
    "layering": 0-100,
    "noise": 0-100
  }
}

COLOR FAMILY SEMANTICS (CRITICAL — this is the primary color intent signal):
- "green"   → terminal screens, nature, ecology, success, military, hacker, CRT phosphor
- "cyan"    → sci-fi, futuristic, neon-blue, tech, cyberpunk cool, space
- "blue"    → corporate, calm, trust, deep ocean, finance (non-gold), banking
- "purple"  → creative, mystical, luxury-dark, cosmic, creative agencies
- "pink"    → playful, vibrant, retro-pop, neon-pink, feminine, fun
- "red"     → power, danger, bold, dramatic, strong, aggressive
- "orange"  → warm, retro, energetic, sunset, vintage
- "gold"    → luxury, premium, wealth, financial gold, opulent, VIP
- "warm"    → earthy, cozy, sunset, amber, general warmth (less specific than gold)
- "neutral" → no specific color requested; let other dimensions decide

IMPORTANT: When the user explicitly mentions a color or color-associated theme, ALWAYS set colorFamily.
Examples:
- "green" → colorFamily: "green"
- "terminal" / "CRT" / "phosphor" → colorFamily: "green"
- "neon cyan" / "sci-fi blue" → colorFamily: "cyan"
- "gold" / "luxury fintech" / "wealth" → colorFamily: "gold"
- "purple" / "cosmic" → colorFamily: "purple"
- "military" / "command center" → colorFamily: "green"
- No color mentioned → colorFamily: "neutral"

DIMENSION SEMANTICS:
- appearance: "dark" for night/dark/space themes, "light" for day/bright/clean themes
- energy: 0=calm subdued, 100=intense vibrant explosive
- softness: 0=harsh geometric hard-edged, 100=soft rounded organic
- density: 0=airy spacious empty, 100=packed dense information-rich
- futurism: 0=traditional classic familiar, 100=alien sci-fi futuristic
- luxury: 0=utilitarian cheap functional, 100=opulent premium expensive
- professionalism: 0=casual informal playful, 100=corporate institutional formal
- playfulness: 0=serious stoic, 100=whimsical fun childlike
- minimalism: 0=maximalist decorated ornate, 100=zen stripped bare
- expressiveness: 0=restrained muted, 100=bold loud colorful
- geometry.roundness: 0=sharp 90-degree corners, 100=fully rounded pill shapes
- geometry.sharpness: 0=no grid lines, 100=heavy visible structure
- geometry.borderStrength: 0=invisible borders, 100=bold thick visible borders
- motion.intensity: 0=static no animation, 100=kinetic highly animated
- motion.smoothness: 0=snappy mechanical instant, 100=fluid organic flowing
- typography.style: "modern"=geometric sans, "technical"=monospace influenced, "retro"=display/slab, "editorial"=serif influenced, "playful"=rounded friendly
- typography.weight: "light"=thin elegant, "medium"=balanced, "bold"=heavy impactful
- visualLanguage.glow: 0=no glow, 100=strong neon halo effects
- visualLanguage.transparency: 0=opaque solid, 100=frosted glass translucent
- visualLanguage.layering: 0=flat no depth, 100=deep 3D layered shadows
- visualLanguage.noise: 0=clean digital, 100=organic textured grainy

EXAMPLES:
"cyberpunk trading terminal" → colorFamily:"cyan", energy:90, futurism:95, glow:90, roundness:5, appearance:"dark"
"green terminal" → colorFamily:"green", futurism:40, professionalism:90, glow:30, appearance:"dark"
"Apple keynote slides" → colorFamily:"neutral", minimalism:95, professionalism:95, luxury:80, appearance:"dark"
"military command center" → colorFamily:"green", professionalism:100, density:90, minimalism:80
"luxury fintech" → colorFamily:"gold", luxury:95, professionalism:90, transparency:75
"playful startup" → colorFamily:"pink", playfulness:90, energy:80, roundness:85, appearance:"light"

Remember: Output ONLY the JSON object. Nothing else.`;


// ─── Extractor ────────────────────────────────────────────────────────────────

export interface SemanticExtractionResult {
  profile: SemanticValidationResult['profile'];
  rawLLMOutput: string;
  validationWarnings: string[];
  wasNormalized: boolean;
  error?: string;
}

/**
 * Extract a SemanticStyleProfile from a natural language prompt using Gemini.
 *
 * - Never throws to the caller
 * - Falls back to defaultSemanticProfile on any error
 * - Validates and normalizes all LLM output before returning
 */
export async function extractSemanticProfile(
  userPrompt: string
): Promise<SemanticExtractionResult> {
  let rawOutput = '';

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: getGeminiModelName(),
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,       // Low temperature for consistent output
        topP: 0.8,
        maxOutputTokens: 1024,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userPrompt);
    rawOutput = result.response.text().trim();

    // Strip markdown code fences if the model still adds them
    const cleaned = rawOutput
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    const validated = validateSemanticProfile(parsed);

    return {
      profile: validated.profile,
      rawLLMOutput: rawOutput,
      validationWarnings: validated.warnings,
      wasNormalized: validated.wasNormalized,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);

    // Dev mode logging
    if (import.meta.env.DEV) {
      console.error('[SemanticExtractor] Error:', error);
      if (rawOutput) console.warn('[SemanticExtractor] Raw LLM output:', rawOutput);
    }

    return {
      profile: { ...defaultSemanticProfile },
      rawLLMOutput: rawOutput,
      validationWarnings: [],
      wasNormalized: true,
      error: `AI extraction failed: ${error}`,
    };
  }
}
