// ─── Theme DNA Preset Registry ───────────────────────────────────────────────
// Central index of all named DNA presets.
// Each preset is a complete PartialThemeTokens that defines a full personality.
// ─────────────────────────────────────────────────────────────────────────────

import type { PartialThemeTokens } from '../themeTypes';
import { appleExecutive } from './appleExecutive';
import { bloombergTerminal } from './bloombergTerminal';
import { cyberpunkNeon } from './cyberpunkNeon';
import { militaryCommand } from './militaryCommand';
import { luxuryFintech } from './luxuryFintech';
import { editorialMagazine } from './editorialMagazine';
import { scientificResearch } from './scientificResearch';

export interface PresetEntry {
  id: string;
  name: string;
  description: string;
  tokens: PartialThemeTokens;
}

export const presetRegistry: PresetEntry[] = [
  {
    id: 'apple-executive',
    name: 'Apple Executive',
    description: 'Clean, spacious, SF-like sans-serif, deep elevation, minimal borders',
    tokens: appleExecutive,
  },
  {
    id: 'bloomberg-terminal',
    name: 'Bloomberg Terminal',
    description: 'Ultra-dense monospace, zero radius, no animation, bright data on black',
    tokens: bloombergTerminal,
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Neon glow, glassmorphism, fast springs, diamond dots, futuristic',
    tokens: cyberpunkNeon,
  },
  {
    id: 'military-command',
    name: 'Military Command',
    description: 'CRT phosphor green, heavy borders, blocky layout, all-uppercase mono',
    tokens: militaryCommand,
  },
  {
    id: 'luxury-fintech',
    name: 'Luxury Fintech',
    description: 'Golden palette, serif headings, generous whitespace, subtle glass',
    tokens: luxuryFintech,
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Paper-white, serif/sans pairing, right legends, print-inspired',
    tokens: editorialMagazine,
  },
  {
    id: 'scientific-research',
    name: 'Scientific Research',
    description: 'Clinical, monospace data labels, solid gridlines, precise and minimal',
    tokens: scientificResearch,
  },
];

export function getPresetById(id: string): PresetEntry | undefined {
  return presetRegistry.find((p) => p.id === id);
}

// Re-export individual presets
export {
  appleExecutive,
  bloombergTerminal,
  cyberpunkNeon,
  militaryCommand,
  luxuryFintech,
  editorialMagazine,
  scientificResearch,
};
