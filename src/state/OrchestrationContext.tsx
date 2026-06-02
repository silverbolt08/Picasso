/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ChartConfig } from '../types';
import type { DashboardPlan } from '../composer/composerTypes';
import type { PartialThemeTokens } from '../theme/themeTypes';
import { runPicassoPipeline } from '../langchain/pipeline';
import { ensureChartIds, parseChartJson } from '../utils/helpers';
import { useTheme } from '../theme/ThemeProvider';

interface OrchestrationState {
  rawJson: string;
  intent: string;
  themePrompt: string;
  charts: ChartConfig[] | null;
  plan: DashboardPlan | null;
  themeTokens: PartialThemeTokens | null;
  isGenerating: boolean;
  error: string | null;
}

interface OrchestrationContextValue extends OrchestrationState {
  setRawJson: (value: string) => void;
  setIntent: (value: string) => void;
  setThemePrompt: (value: string) => void;
  clearResult: () => void;
  runPipeline: () => Promise<{ ok: boolean }>;
}

const OrchestrationContext = createContext<OrchestrationContextValue | undefined>(undefined);

export function OrchestrationProvider({ children }: { children: ReactNode }) {
  const { applyPipelineTheme } = useTheme();
  const [rawJson, setRawJson] = useState('');
  const [intent, setIntent] = useState('');
  const [themePrompt, setThemePrompt] = useState('');
  const [charts, setCharts] = useState<ChartConfig[] | null>(null);
  const [plan, setPlan] = useState<DashboardPlan | null>(null);
  const [themeTokens, setThemeTokens] = useState<PartialThemeTokens | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResult = useCallback(() => {
    setCharts(null);
    setPlan(null);
    setThemeTokens(null);
  }, []);

  const handleSetRawJson = useCallback((value: string) => {
    setRawJson(value);
    if (error) setError(null);
  }, [error]);

  const handleSetIntent = useCallback((value: string) => {
    setIntent(value);
    if (error) setError(null);
  }, [error]);

  const handleSetThemePrompt = useCallback((value: string) => {
    setThemePrompt(value);
    if (error) setError(null);
  }, [error]);

  const runPipeline = useCallback(async () => {
    setError(null);

    if (!rawJson.trim()) {
      setError('JSON input is required.');
      return { ok: false };
    }
    if (!intent.trim()) {
      setError('Business intent is required.');
      return { ok: false };
    }
    if (!themePrompt.trim()) {
      setError('Theme prompt is required.');
      return { ok: false };
    }

    const parsed = parseChartJson(rawJson);
    if (!parsed) {
      setError('Invalid JSON. Provide an array of chart objects with type, title, and data.');
      return { ok: false };
    }

    const normalizedCharts = ensureChartIds(parsed);

    setIsGenerating(true);
    try {
      const result = await runPicassoPipeline({
        charts: normalizedCharts,
        themePrompt: themePrompt.trim(),
        userIntent: intent.trim(),
      });

      setCharts(normalizedCharts);
      setPlan(result.dashboardPlan);
      setThemeTokens(result.themeTokens);

      if (Object.keys(result.themeTokens).length > 0) {
        applyPipelineTheme(result.themeTokens, themePrompt.trim());
      }

      setIsGenerating(false);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setIsGenerating(false);
      return { ok: false };
    }
  }, [applyPipelineTheme, intent, rawJson, themePrompt]);

  const value = useMemo(
    () => ({
      rawJson,
      intent,
      themePrompt,
      charts,
      plan,
      themeTokens,
      isGenerating,
      error,
      setRawJson: handleSetRawJson,
      setIntent: handleSetIntent,
      setThemePrompt: handleSetThemePrompt,
      clearResult,
      runPipeline,
    }),
    [
      charts,
      clearResult,
      error,
      handleSetIntent,
      handleSetRawJson,
      handleSetThemePrompt,
      intent,
      isGenerating,
      plan,
      rawJson,
      themePrompt,
      themeTokens,
      runPipeline,
    ]
  );

  return (
    <OrchestrationContext.Provider value={value}>
      {children}
    </OrchestrationContext.Provider>
  );
}

export function useOrchestration() {
  const context = useContext(OrchestrationContext);
  if (!context) {
    throw new Error('useOrchestration must be used within OrchestrationProvider');
  }
  return context;
}
