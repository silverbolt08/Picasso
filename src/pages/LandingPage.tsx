import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrchestration } from '../state/OrchestrationContext';

/* ─── Data Constants (unchanged) ─────────────────────────────────────────── */
const JSON_PLACEHOLDER = `[
  {
    "type": "bar",
    "title": "Monthly Revenue",
    "data": [
      { "label": "Jan", "value": 42000 },
      { "label": "Feb", "value": 58000 },
      { "label": "Mar", "value": 51000 }
    ]
  }
]`;

const INTENT_EXAMPLES = [
  'Focus on revenue growth',
  'Analyze retention and churn',
  'Executive operational overview',
];

const THEME_EXAMPLES = [
  'Cyberpunk neon trading terminal',
  'Luxury fintech dashboard',
  'Apple-style minimal dashboard',
];

/* ─── Line Numbers Helper ────────────────────────────────────────────────── */
function useLineNumbers(text: string) {
  const lineCount = useMemo(() => {
    const lines = text.split('\n').length;
    return Math.max(lines, 20); // show at least 20 lines
  }, [text]);

  return lineCount;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const {
    rawJson,
    intent,
    themePrompt,
    setRawJson,
    setIntent,
    setThemePrompt,
    runPipeline,
    isGenerating,
    error,
  } = useOrchestration();

  const canGenerate = useMemo(
    () => Boolean(rawJson.trim() && intent.trim() && themePrompt.trim() && !isGenerating),
    [intent, isGenerating, rawJson, themePrompt]
  );

  const handleGenerate = async () => {
    const result = await runPipeline();
    if (result.ok) {
      navigate('/dashboard');
    }
  };

  /* ── Line numbers for JSON textarea ── */
  const lineCount = useLineNumbers(rawJson || JSON_PLACEHOLDER);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleTextareaScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  /* ── Sync line numbers scroll ── */
  const [jsonScrollTop, setJsonScrollTop] = useState(0);
  useEffect(() => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = jsonScrollTop;
    }
  }, [jsonScrollTop]);

  return (
    <div className="br-page br-grain">

      {/* ═══ Navigation ═══ */}
      <header className="br-nav">
        <div>
          <p className="br-nav__brand-name">PICASSO</p>
          <p className="br-nav__brand-sub">ORCHESTRATION COMMAND CENTER</p>
        </div>
        <div className="br-nav__status">
          <span className="br-nav__status-label">ADAPTIVE INTELLIGENCE</span>
          <span className="br-nav__pulse-dot" />
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="br-hero">
        <h1 className="br-hero__headline">
          <span className="br-hero__line">Orchestrate</span>
          <span className="br-hero__line">data, intent,</span>
          <span className="br-hero__line">and aesthetic</span>
          <span className="br-hero__line">into one plan.</span>
        </h1>
        <p className="br-hero__subtitle">
          Feed Picasso your raw JSON, business intent, and visual prompt. The pipeline
          fuses semantic priority, spatial density, and theme intelligence into a
          deterministic adaptive dashboard.
        </p>
      </section>

      {/* ═══ Input Grid ═══ */}
      <section className="br-grid">

        {/* ── Panel A: JSON Data (7 cols) ── */}
        <div className="br-panel br-panel--json">
          <div className="br-panel__header">
            <span className="br-panel__label">JSON DATA</span>
            <span className="br-panel__input-id">INPUT A</span>
          </div>
          <p className="br-panel__title">Paste KPI data to orchestrate</p>
          <div className="br-textarea-wrap br-textarea-wrap--with-lines">
            <div
              className="br-line-numbers"
              ref={lineNumbersRef}
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="br-textarea br-textarea--full"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              onScroll={(e) => {
                handleTextareaScroll();
                setJsonScrollTop((e.target as HTMLTextAreaElement).scrollTop);
              }}
              placeholder={JSON_PLACEHOLDER}
              spellCheck={false}
              id="json-input"
            />
          </div>
        </div>

        {/* ── Panel B: Business Intent (5 cols, top) ── */}
        <div className="br-panel br-panel--intent">
          <div className="br-panel__header">
            <span className="br-panel__label">BUSINESS INTENT</span>
            <span className="br-panel__input-id">INPUT B</span>
          </div>
          <p className="br-panel__title">Define the narrative focus</p>
          <textarea
            className="br-textarea br-textarea--compact"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe the business objective..."
            id="intent-input"
          />
          <div className="br-pills">
            {INTENT_EXAMPLES.map((example) => (
              <button
                key={example}
                className="br-pill"
                onClick={() => setIntent(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* ── Panel C: Visual Aesthetic (5 cols, bottom) ── */}
        <div className="br-panel br-panel--aesthetic">
          <div className="br-panel__header">
            <span className="br-panel__label">VISUAL AESTHETIC</span>
            <span className="br-panel__input-id">INPUT C</span>
          </div>
          <p className="br-panel__title">Select the atmosphere</p>
          <textarea
            className="br-textarea br-textarea--compact"
            value={themePrompt}
            onChange={(e) => setThemePrompt(e.target.value)}
            placeholder="Describe the visual mood..."
            id="aesthetic-input"
          />
          <div className="br-pills">
            {THEME_EXAMPLES.map((example) => (
              <button
                key={example}
                className="br-pill"
                onClick={() => setThemePrompt(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* ── Generate Area (5 cols, bottom row) ── */}
        <div className="br-panel br-panel--generate">
          <button
            className="br-generate"
            onClick={handleGenerate}
            disabled={!canGenerate}
            type="button"
            id="generate-button"
          >
            {isGenerating ? 'RUNNING PIPELINE...' : 'GENERATE DASHBOARD'}
          </button>

          {error && (
            <p className="br-error">{error}</p>
          )}

          {!error && (
            <p className="br-generate__caption">
              Picasso compiles spatial density, priority relevancy, and aesthetic theme.
            </p>
          )}
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="br-footer">
        <p className="br-footer__note">
          <span aria-hidden="true">🔒</span>
          Chart titles are the only text sent to the model. Values stay local.
        </p>
      </footer>
    </div>
  );
}
