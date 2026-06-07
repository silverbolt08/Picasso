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

const JSON_EXAMPLES = [
  {
    label: "Enterprise KPIs",
    data: `[
  {
    "id": "global-revenue",
    "type": "line",
    "title": "Global Quarterly Revenue Acceleration",
    "data": [
      { "label": "Q1", "value": 4200 },
      { "label": "Q2", "value": 5800 },
      { "label": "Q3", "value": 7200 },
      { "label": "Q4", "value": 9300 }
    ]
  },
  {
    "id": "enterprise-subscriptions",
    "type": "line",
    "title": "Enterprise Subscription Expansion",
    "data": [
      { "label": "Jan", "value": 160 },
      { "label": "Feb", "value": 190 },
      { "label": "Mar", "value": 230 },
      { "label": "Apr", "value": 275 }
    ]
  },
  {
    "id": "conversion-funnel",
    "type": "bar",
    "title": "Executive Conversion Funnel Performance",
    "data": [
      { "label": "Visitors", "value": 12000 },
      { "label": "Qualified Leads", "value": 3400 },
      { "label": "Trials", "value": 1200 },
      { "label": "Enterprise Deals", "value": 320 }
    ]
  },
  {
    "id": "regional-revenue",
    "type": "bar",
    "title": "Regional Enterprise Revenue Performance",
    "data": [
      { "label": "North America", "value": 82 },
      { "label": "Europe", "value": 64 },
      { "label": "Asia Pacific", "value": 76 },
      { "label": "Middle East", "value": 31 }
    ]
  },
  {
    "id": "retention-index",
    "type": "line",
    "title": "Customer Retention Stability Index",
    "data": [
      { "label": "Week 1", "value": 94 },
      { "label": "Week 2", "value": 94 },
      { "label": "Week 3", "value": 93 },
      { "label": "Week 4", "value": 95 }
    ]
  },
  {
    "id": "support-metrics",
    "type": "pie",
    "title": "Customer Support Resolution Metrics",
    "data": [
      { "label": "Resolved", "value": 82 },
      { "label": "Pending", "value": 11 },
      { "label": "Escalated", "value": 7 }
    ]
  },
  {
    "id": "traffic-sources",
    "type": "pie",
    "title": "Traffic Acquisition Intelligence",
    "data": [
      { "label": "Organic", "value": 42 },
      { "label": "Paid Acquisition", "value": 31 },
      { "label": "Referral", "value": 15 },
      { "label": "Social Media", "value": 12 }
    ]
  },
  {
    "id": "department-efficiency",
    "type": "line",
    "title": "Operational Department Efficiency Metrics",
    "data": [
      { "label": "January", "value": 68 },
      { "label": "February", "value": 73 },
      { "label": "March", "value": 81 },
      { "label": "April", "value": 89 }
    ]
  },
  {
    "id": "office-temperature",
    "type": "line",
    "title": "Office Temperature Sensor Readings",
    "data": [
      { "label": "Monday", "value": 22 },
      { "label": "Tuesday", "value": 23 },
      { "label": "Wednesday", "value": 21 },
      { "label": "Thursday", "value": 24 }
    ]
  },
  {
    "id": "parking-utilization",
    "type": "bar",
    "title": "Parking Garage Utilization Statistics",
    "data": [
      { "label": "Zone A", "value": 62 },
      { "label": "Zone B", "value": 48 },
      { "label": "Zone C", "value": 71 }
    ]
  }
]`
  },
  {
    label: "Security SOC",
    data: `[
  {
    "type": "line",
    "title": "Threat Detection Volume",
    "data": [
      { "label": "00:00", "value": 120 },
      { "label": "06:00", "value": 240 },
      { "label": "12:00", "value": 410 },
      { "label": "18:00", "value": 320 }
    ]
  },
  {
    "type": "bar",
    "title": "Regional Attack Distribution",
    "data": [
      { "label": "North America", "value": 520 },
      { "label": "Europe", "value": 340 },
      { "label": "Asia", "value": 610 },
      { "label": "Middle East", "value": 210 }
    ]
  },
  {
    "type": "pie",
    "title": "Attack Vector Classification",
    "data": [
      { "label": "Phishing", "value": 38 },
      { "label": "Malware", "value": 29 },
      { "label": "DDoS", "value": 18 },
      { "label": "Credential Theft", "value": 15 }
    ]
  },
  {
    "type": "line",
    "title": "Firewall Stability Metrics",
    "data": [
      { "label": "Mon", "value": 72 },
      { "label": "Tue", "value": 83 },
      { "label": "Wed", "value": 91 },
      { "label": "Thu", "value": 79 }
    ]
  },
  {
    "type": "bar",
    "title": "Infrastructure Load Analysis",
    "data": [
      { "label": "API Gateway", "value": 81 },
      { "label": "Auth Service", "value": 74 },
      { "label": "Core Database", "value": 92 },
      { "label": "Monitoring Cluster", "value": 68 }
    ]
  },
  {
    "type": "line",
    "title": "SOC Response Time",
    "data": [
      { "label": "Week 1", "value": 14 },
      { "label": "Week 2", "value": 11 },
      { "label": "Week 3", "value": 9 },
      { "label": "Week 4", "value": 7 }
    ]
  },
  {
    "type": "pie",
    "title": "Authentication Failure Sources",
    "data": [
      { "label": "Bots", "value": 42 },
      { "label": "Credential Stuffing", "value": 31 },
      { "label": "Human Error", "value": 17 },
      { "label": "Unknown", "value": 10 }
    ]
  },
  {
    "type": "bar",
    "title": "Cafeteria Beverage Usage",
    "data": [
      { "label": "Coffee", "value": 62 },
      { "label": "Tea", "value": 48 },
      { "label": "Energy Drinks", "value": 33 }
    ]
  }
]`
  }
];

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
          <div className="br-pills" style={{ marginTop: '1rem' }}>
            {JSON_EXAMPLES.map((example) => (
              <button
                key={example.label}
                className="br-pill"
                onClick={() => setRawJson(example.data)}
                type="button"
              >
                {example.label}
              </button>
            ))}
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
