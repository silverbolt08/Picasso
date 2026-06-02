// ─── Semantic Defaults ───────────────────────────────────────────────────────
// Fallback SemanticStyleProfile used when:
//   - LLM output is malformed or incomplete
//   - Validator cannot recover the input
//   - API call fails entirely
//
// This profile maps closely to the built-in "Midnight" dark theme aesthetic.
// ─────────────────────────────────────────────────────────────────────────────

import type { SemanticStyleProfile } from './semanticTypes';

export const defaultSemanticProfile: SemanticStyleProfile = {
  appearance: 'dark',
  mood: ['professional', 'modern', 'neutral'],
  colorFamily: 'neutral',

  energy: 40,
  softness: 60,
  density: 40,
  futurism: 45,
  luxury: 35,
  professionalism: 70,
  playfulness: 20,
  minimalism: 60,
  expressiveness: 35,

  geometry: {
    roundness: 65,
    sharpness: 30,
    borderStrength: 20,
  },

  motion: {
    intensity: 40,
    smoothness: 70,
  },

  typography: {
    style: 'modern',
    weight: 'medium',
  },

  visualLanguage: {
    glow: 10,
    transparency: 10,
    layering: 30,
    noise: 0,
  },
};
