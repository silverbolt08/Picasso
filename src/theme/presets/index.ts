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
    description: 'Elevated surfaces, keynote zoom animation, minimal labels, generous whitespace, deep shadows',
    tokens: appleExecutive,
  },
  {
    id: 'bloomberg-terminal',
    name: 'Bloomberg Terminal',
    description: 'Terminal panels with scanlines, dense axis grids, monospace everything, zero animation',
    tokens: bloombergTerminal,
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Glassmorphism surfaces, neon chart glow, fast springs, scanline overlay, diamond dots',
    tokens: cyberpunkNeon,
  },
  {
    id: 'military-command',
    name: 'Military Command',
    description: 'CRT phosphor terminal panels, heavy borders, scan animation, tactical HUD density',
    tokens: militaryCommand,
  },
  {
    id: 'luxury-fintech',
    name: 'Luxury Fintech',
    description: 'Glass surfaces, golden ratio type scale, subtle glow, keynote zoom, serif headings',
    tokens: luxuryFintech,
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Paper-textured editorial cards, serif/sans pairing, editorial fade animation, decorative rules',
    tokens: editorialMagazine,
  },
  {
    id: 'scientific-research',
    name: 'Scientific Research',
    description: 'Clean bordered cards, dense axis data, verbose labels, clinical precision, editorial fade',
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
