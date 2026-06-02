import { Navigate, useNavigate } from 'react-router-dom';
import AdaptiveDashboardRenderer from '../components/rendering/AdaptiveDashboardRenderer';
import { useOrchestration } from '../state/OrchestrationContext';
import { useTheme } from '../theme/ThemeProvider';
import { AmbientSurface } from '../design-system/surfaces/Surfaces';
import { getThemeTextStyle } from '../design-system/typography/typeScale';
import ThemeMorphBar from '../components/theme/ThemeMorphBar';
import type { SurfaceMode } from '../theme/themeTypes';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { plan, charts, intent, themePrompt } = useOrchestration();

  if (!plan || !charts || charts.length === 0) {
    return <Navigate to="/" replace />;
  }

  const titleStyle = getThemeTextStyle(theme, 'subheading');
  const metaStyle = getThemeTextStyle(theme, 'micro');
  const surfaceMode: SurfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';

  // ── Terminal Header ────────────────────────────────────────────────────
  const renderTerminalHeader = () => (
    <header
      className="sticky top-0 z-30"
      style={{
        backgroundColor: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 py-3"
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
          fontFamily: theme.typography.monoFont,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: theme.colors.accentPrimary, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
            picasso@dashboard:~$
          </span>
          <span style={{ color: theme.colors.textSecondary, fontSize: '10px' }}>
            --theme={theme.meta.themeName.toLowerCase().replace(/\s+/g, '-')}
          </span>
          <span style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
            --intent="{intent || 'general'}"
          </span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1 text-[10px] font-bold tracking-wider transition-all"
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textMuted,
            fontFamily: theme.typography.monoFont,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          [EXIT]
        </button>
      </div>
    </header>
  );

  // ── Editorial Header ────────────────────────────────────────────────────
  const renderEditorialHeader = () => (
    <header
      className="sticky top-0 z-30"
      style={{
        backgroundColor: theme.meta.appearance === 'dark'
          ? 'rgba(15, 23, 42, 0.92)'
          : 'rgba(255, 255, 255, 0.92)',
        borderBottom: `1px solid ${theme.colors.divider}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 py-5"
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: theme.typography.bodyFont,
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: theme.colors.textMuted,
            }}
          >
            Picasso Intelligence Report
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.colors.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            Adaptive Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 text-[10px] font-medium"
            style={{
              border: `1px solid ${theme.colors.divider}`,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
              borderRadius: '4px',
              fontStyle: 'italic',
            }}
          >
            {intent || 'General Focus'}
          </span>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-[10px] font-medium transition-all hover:opacity-85"
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.divider}`,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            New Report
          </button>
        </div>
      </div>
    </header>
  );

  // ── Apple/Elevated Header ──────────────────────────────────────────────
  const renderElevatedHeader = () => (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        backgroundColor: theme.meta.appearance === 'dark'
          ? 'rgba(0, 0, 0, 0.6)'
          : 'rgba(255, 255, 255, 0.6)',
        borderBottom: 'none',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 py-4"
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary})`,
              color: '#fff',
              fontFamily: theme.typography.displayFont,
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            P
          </div>
          <p
            style={{
              ...titleStyle,
              color: theme.colors.textPrimary,
              fontSize: '14px',
            }}
          >
            Dashboard
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-1.5 text-[11px] font-medium transition-all hover:opacity-85"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: theme.colors.accentPrimary,
            fontFamily: theme.typography.bodyFont,
            cursor: 'pointer',
          }}
        >
          New Orchestration →
        </button>
      </div>
    </header>
  );

  // ── Default/Glass Header ───────────────────────────────────────────────
  const renderDefaultHeader = () => (
    <header
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{
        backgroundColor: theme.meta.appearance === 'dark' 
          ? 'rgba(15, 23, 42, 0.45)' 
          : 'rgba(255, 255, 255, 0.45)',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 py-5"
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary})`,
              color: theme.colors.background,
              fontFamily: theme.typography.displayFont,
              fontWeight: 700,
              borderRadius: theme.cardStyle.borderRadius === '0px' ? '4px' : '8px',
            }}
          >
            P
          </div>
          <div>
            <p
              style={{
                ...metaStyle,
                color: theme.colors.textMuted,
              }}
            >
              Picasso
            </p>
            <p
              className="mt-0.5"
              style={{
                ...titleStyle,
                color: theme.colors.textPrimary,
              }}
            >
              Adaptive Dashboard
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: `${theme.colors.accentPrimary}12`,
              color: theme.colors.accentPrimary,
              fontFamily: theme.typography.bodyFont,
              borderRadius: theme.cardStyle.borderRadius === '0px' ? '2px' : '9999px',
            }}
          >
            Intent: {intent || 'General Focus'}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: `${theme.colors.accentSecondary}12`,
              color: theme.colors.accentSecondary,
              fontFamily: theme.typography.bodyFont,
              borderRadius: theme.cardStyle.borderRadius === '0px' ? '2px' : '9999px',
            }}
          >
            Aesthetic: {themePrompt || 'Default'}
          </span>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-[11px] font-semibold transition-all hover:opacity-85"
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
              cursor: 'pointer',
              borderRadius: theme.cardStyle.borderRadius === '0px' ? '2px' : '9999px',
            }}
          >
            New Orchestration
          </button>
        </div>
      </div>
    </header>
  );

  // ── Choose header based on surfaceMode ─────────────────────────────────
  const renderHeader = () => {
    switch (surfaceMode) {
      case 'terminal': return renderTerminalHeader();
      case 'editorial': return renderEditorialHeader();
      case 'elevated': return renderElevatedHeader();
      default: return renderDefaultHeader();
    }
  };

  return (
    <AmbientSurface>
      {renderHeader()}

      {/* Main Content Area */}
      <main
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          paddingTop: '3rem',
          paddingBottom: '6rem',
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
        }}
      >
        <AdaptiveDashboardRenderer plan={plan} charts={charts} />
      </main>

      {/* Theme Morphing Toolbar */}
      <ThemeMorphBar />
    </AmbientSurface>
  );
}
