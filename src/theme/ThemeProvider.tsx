/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ThemeTokens, PartialThemeTokens, ThemeAppearance } from './themeTypes';
import { darkTheme, lightTheme } from './themes';
import { resolveTheme } from './resolveTheme';
import type { SemanticStyleProfile } from '../semantic/semanticTypes';
import { semanticToTheme } from '../semantic/semanticToTheme';

/** Active theme source — built-in mode, named preset, custom JSON, or AI-generated */
export type ThemeSource =
  | { type: 'builtin'; mode: ThemeAppearance }
  | { type: 'preset'; presetId: string; presetName: string }
  | { type: 'custom' }
  | { type: 'semantic'; prompt: string; themeName: string };

interface ThemeContextValue {
  /** Current appearance mode */
  mode: ThemeAppearance;
  /** Fully resolved theme tokens */
  theme: ThemeTokens;
  /** Where the active theme came from */
  source: ThemeSource;
  /** Switch to a built-in appearance mode */
  setMode: (mode: ThemeAppearance) => void;
  /** Toggle between dark and light */
  toggleMode: () => void;
  /** Apply a named preset (resolved against appropriate base) */
  applyPreset: (presetId: string, presetName: string, tokens: PartialThemeTokens) => void;
  /** Apply arbitrary custom partial tokens */
  setCustomTheme: (tokens: PartialThemeTokens) => void;
  /** Apply a SemanticStyleProfile — compiled deterministically to tokens */
  applySemanticTheme: (profile: SemanticStyleProfile, prompt: string) => void;
  /** Apply tokens generated from the full AI pipeline */
  applyPipelineTheme: (tokens: PartialThemeTokens, prompt: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeAppearance;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeAppearance>(initialMode);
  const [customTokens, setCustomTokens] = useState<PartialThemeTokens | null>(null);
  const [source, setSource] = useState<ThemeSource>({ type: 'builtin', mode: initialMode });

  const theme = useMemo(() => {
    if (customTokens) {
      const base = mode === 'dark' ? darkTheme : lightTheme;
      return resolveTheme(customTokens, base);
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode, customTokens]);

  const setMode = (newMode: ThemeAppearance) => {
    setModeState(newMode);
    setCustomTokens(null);
    setSource({ type: 'builtin', mode: newMode });
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const applyPreset = (presetId: string, presetName: string, tokens: PartialThemeTokens) => {
    const appearance = tokens.meta?.appearance ?? mode;
    setModeState(appearance);
    setCustomTokens(tokens);
    setSource({ type: 'preset', presetId, presetName });
  };

  const setCustomTheme = (tokens: PartialThemeTokens) => {
    const appearance = tokens.meta?.appearance ?? mode;
    setModeState(appearance);
    setCustomTokens(tokens);
    setSource({ type: 'custom' });
  };

  const applySemanticTheme = (profile: SemanticStyleProfile, prompt: string) => {
    const { tokens } = semanticToTheme(profile);
    const appearance = tokens.meta?.appearance ?? profile.appearance;
    setModeState(appearance);
    setCustomTokens(tokens);
    const themeName = (tokens.meta?.themeName as string | undefined) ?? 'AI Theme';
    setSource({ type: 'semantic', prompt, themeName });
  };

  const applyPipelineTheme = (tokens: PartialThemeTokens, prompt: string) => {
    const appearance = tokens.meta?.appearance ?? mode;
    setModeState(appearance);
    setCustomTokens(tokens);
    const themeName = (tokens.meta?.themeName as string | undefined) ?? 'AI Theme';
    setSource({ type: 'semantic', prompt, themeName });
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, source, setMode, toggleMode, applyPreset, setCustomTheme, applySemanticTheme, applyPipelineTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
