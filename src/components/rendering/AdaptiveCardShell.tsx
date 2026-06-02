import { useTheme } from '../../theme/ThemeProvider';
import type { ComposedChart, PlacementTier } from '../../composer/composerTypes';
import type { ChartConfig } from '../../types';
import ChartRenderer from '../charts/ChartRenderer';
import { HeroSurface, PrimarySurface, SecondarySurface } from '../../design-system/surfaces/Surfaces';
import { getThemeTextStyle } from '../../design-system/typography/typeScale';
import { formatNumber } from '../../utils/helpers';
import type { SurfaceMode } from '../../theme/themeTypes';

interface AdaptiveCardShellProps {
  composed: ComposedChart;
  chart: ChartConfig;
  layout: PlacementTier;
}

// ─── Terminal Header Bar ─────────────────────────────────────────────────
// Renders a mock terminal chrome bar with dots and title.

function TerminalHeaderBar({ title, accent, theme }: { title: string; accent: string; theme: any }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 -mx-[var(--card-px)] -mt-[var(--card-px)] mb-4"
      style={{
        '--card-px': theme.spacing.cardPadding,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.meta.appearance === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
        fontFamily: theme.typography.monoFont,
        fontSize: '10px',
        letterSpacing: '0.05em',
        color: theme.colors.textMuted,
        marginLeft: `calc(-1 * ${theme.spacing.cardPadding})`,
        marginRight: `calc(-1 * ${theme.spacing.cardPadding})`,
        marginTop: `calc(-1 * ${theme.spacing.cardPadding})`,
        paddingLeft: theme.spacing.cardPadding,
        paddingRight: theme.spacing.cardPadding,
      } as React.CSSProperties}
    >
      <span style={{ color: '#ff5f57', fontSize: '8px' }}>●</span>
      <span style={{ color: '#febc2e', fontSize: '8px' }}>●</span>
      <span style={{ color: '#28c840', fontSize: '8px' }}>●</span>
      <span className="ml-2" style={{ color: accent, textTransform: 'uppercase' }}>
        [{title}]
      </span>
    </div>
  );
}

// ─── Editorial Decorative Rule ───────────────────────────────────────────

function EditorialRule({ theme }: { theme: any }) {
  return (
    <div
      className="my-3"
      style={{
        height: '1px',
        background: `linear-gradient(to right, ${theme.colors.accentPrimary}40, ${theme.colors.divider}, transparent)`,
        maxWidth: '80px',
      }}
    />
  );
}

export default function AdaptiveCardShell({ composed, chart, layout }: AdaptiveCardShellProps) {
  const { theme } = useTheme();
  const surfaceMode: SurfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';

  const typeLabel = chart.type === 'bar' ? 'Bar Chart'
    : chart.type === 'line' ? 'Line Chart'
    : 'Pie Chart';
  const accent = theme.chartStyle.chartAccents[chart.type];

  // Map placement to surface component
  let SurfaceComponent: typeof PrimarySurface;
  if (layout === 'hero' || layout === 'spotlight') {
    SurfaceComponent = HeroSurface as typeof PrimarySurface;
  } else if (layout === 'primary' || layout === 'featured') {
    SurfaceComponent = PrimarySurface;
  } else {
    SurfaceComponent = SecondarySurface as typeof PrimarySurface;
  }

  // Determine typography scale for the card header — using Theme DNA
  const isHeroLevel = layout === 'hero' || layout === 'spotlight';
  const titleStyle = getThemeTextStyle(theme, isHeroLevel ? 'heading' : 'subheading');
  const metaStyle = getThemeTextStyle(theme, 'micro');

  // Compute a key KPI metric for the Hero Centerpiece
  const summaryMetric = (() => {
    if (!chart.data || chart.data.length === 0) return null;
    const values = chart.data.map(d => d.value);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    
    const isPercentage = chart.title.toLowerCase().includes('percent') || chart.title.toLowerCase().includes('rate');
    
    if (chart.type === 'pie') {
      return {
        label: 'Max Segment',
        value: `${formatNumber(max)}%`,
      };
    }
    
    if (chart.title.toLowerCase().includes('revenue') || chart.title.toLowerCase().includes('sales') || chart.title.toLowerCase().includes('price')) {
      return {
        label: 'Total Cumulative Revenue',
        value: `$${formatNumber(sum)}`,
      };
    }
    
    return {
      label: 'Run Rate Average',
      value: isPercentage ? `${formatNumber(avg)}%` : formatNumber(Math.round(avg)),
    };
  })();

  // ── Terminal mode: card title renders as terminal prompt ────────────────
  const renderTerminalTitle = () => (
    <>
      <TerminalHeaderBar title={typeLabel} accent={accent} theme={theme} />
      <div className="mb-6 relative z-10">
        <span
          style={{
            ...metaStyle,
            color: theme.colors.textMuted,
            fontFamily: theme.typography.monoFont,
          }}
        >
          {'>'} 
        </span>
        <h2
          className="inline"
          style={{
            ...titleStyle,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.monoFont,
          }}
        >
          {chart.title}
          <span
            className="inline-block ml-0.5"
            style={{
              width: '2px',
              height: '1em',
              backgroundColor: accent,
              animation: 'blink 1s step-end infinite',
              verticalAlign: 'text-bottom',
            }}
          />
        </h2>
        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    </>
  );

  // ── Editorial mode: serif title with decorative rule ────────────────────
  const renderEditorialTitle = () => (
    <div className="mb-8 relative z-10">
      <p
        style={{
          ...metaStyle,
          color: theme.colors.textMuted,
          fontFamily: theme.typography.bodyFont,
          letterSpacing: '0.15em',
        }}
      >
        {typeLabel}
      </p>
      <EditorialRule theme={theme} />
      <h2
        style={{
          ...titleStyle,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.headingFont,
        }}
      >
        {chart.title}
      </h2>

      {/* KPI for hero/spotlight/featured with editorial styling */}
      {(layout === 'hero' || layout === 'spotlight' || layout === 'featured') && summaryMetric && (
        <div className="mt-5 flex items-baseline gap-2.5">
          <span
            style={{
              fontFamily: theme.typography.monoFont,
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 600,
              color: theme.colors.textPrimary,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {summaryMetric.value}
          </span>
          <span
            style={{
              fontFamily: theme.typography.bodyFont,
              fontSize: '11px',
              fontWeight: 400,
              color: theme.colors.textMuted,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontStyle: 'italic',
            }}
          >
            {summaryMetric.label}
          </span>
        </div>
      )}
    </div>
  );

  // ── Apple/Elevated mode: minimal, clean, no labels ─────────────────────
  const renderElevatedTitle = () => (
    <div className="mb-8 relative z-10">
      <h2
        style={{
          ...titleStyle,
          color: theme.colors.textPrimary,
        }}
      >
        {chart.title}
      </h2>

      {(layout === 'hero' || layout === 'spotlight' || layout === 'featured') && summaryMetric && (
        <div className="mt-5 flex items-baseline gap-3">
          <span
            style={{
              fontFamily: theme.typography.monoFont,
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              fontWeight: 700,
              color: theme.colors.textPrimary,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {summaryMetric.value}
          </span>
          <span
            style={{
              fontFamily: theme.typography.bodyFont,
              fontSize: '12px',
              fontWeight: 500,
              color: theme.colors.textMuted,
              letterSpacing: '0.02em',
              textTransform: theme.typography.metadataTransform ?? 'uppercase',
            }}
          >
            {summaryMetric.label}
          </span>
        </div>
      )}
    </div>
  );

  // ── Default header (glass, bordered, invisible) ────────────────────────
  const renderDefaultHeader = () => (
    <div className="mb-8 relative z-10 flex flex-wrap items-start justify-between gap-4">
      <div className="flex-1 min-w-[200px]">
        <p
          style={{
            ...metaStyle,
            color: theme.colors.textMuted,
          }}
        >
          {typeLabel}
        </p>
        <h2
          className="mt-2"
          style={{
            ...titleStyle,
            color: theme.colors.textPrimary,
          }}
        >
          {chart.title}
        </h2>

        {/* Large KPI Highlight on Hero/Spotlight/Featured widgets */}
        {(layout === 'hero' || layout === 'spotlight' || layout === 'featured') && summaryMetric && (
          <div className="mt-4 flex items-baseline gap-2.5">
            <span
              style={{
                fontFamily: theme.typography.monoFont,
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: theme.colors.textPrimary,
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              {summaryMetric.value}
            </span>
            <span
              style={{
                fontFamily: theme.typography.metadataFont ?? theme.typography.bodyFont,
                fontSize: '11px',
                fontWeight: 500,
                color: theme.colors.textMuted,
                letterSpacing: '0.02em',
                textTransform: theme.typography.metadataTransform ?? 'uppercase',
              }}
            >
              {summaryMetric.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        {(layout === 'hero' || layout === 'spotlight' || layout === 'featured') && (
          <span
            className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider rounded"
            style={{
              backgroundColor: (composed.promotedHero || layout === 'featured')
                ? `${theme.colors.accentSecondary}15`
                : `${theme.colors.accentPrimary}15`,
              color: (composed.promotedHero || layout === 'featured')
                ? theme.colors.accentSecondary
                : theme.colors.accentPrimary,
              fontFamily: theme.typography.monoFont,
              textTransform: theme.typography.metadataTransform ?? 'uppercase',
              borderRadius: theme.cardStyle.borderRadius === '0px' ? '0px' : '4px',
            }}
          >
            {layout === 'featured' || composed.promotedHero
              ? 'Featured'
              : layout === 'spotlight'
              ? 'Spotlight'
              : 'Executive'}
          </span>
        )}
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>
    </div>
  );

  // ── Choose header renderer based on surfaceMode ────────────────────────
  const renderHeader = () => {
    switch (surfaceMode) {
      case 'terminal': return renderTerminalTitle();
      case 'editorial': return renderEditorialTitle();
      case 'elevated': return renderElevatedTitle();
      default: return renderDefaultHeader();
    }
  };

  return (
    <SurfaceComponent
      glowColor={accent}
      isHoverable={true}
      className="flex flex-col h-full w-full"
      style={{
        borderColor: isHeroLevel && surfaceMode !== 'terminal' && surfaceMode !== 'elevated'
          ? theme.colors.accentPrimary 
          : theme.colors.border,
      }}
    >
      {renderHeader()}

      {/* Chart container */}
      <div className="flex-1 relative z-10 min-h-[260px] w-full">
        <ChartRenderer config={chart} hero={layout === 'hero' || layout === 'spotlight'} />
      </div>

      {/* Rationale and explainability */}
      {(layout === 'hero' || layout === 'spotlight' || layout === 'primary' || layout === 'featured') && composed.rationale && composed.rationale.length > 0 && (
        <div 
          className="mt-6 pt-4 border-t text-[11px] leading-relaxed" 
          style={{ 
            borderColor: theme.colors.divider,
            color: theme.colors.textMuted,
            fontFamily: surfaceMode === 'editorial' ? theme.typography.bodyFont : theme.typography.bodyFont,
            fontStyle: surfaceMode === 'editorial' ? 'italic' : 'normal',
          }}
        >
          <p>{composed.rationale[0]}</p>
        </div>
      )}
    </SurfaceComponent>
  );
}