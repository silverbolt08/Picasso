import { Navigate, useNavigate } from 'react-router-dom';
import AdaptiveDashboardRenderer from '../components/rendering/AdaptiveDashboardRenderer';
import { useOrchestration } from '../state/OrchestrationContext';
import { useTheme } from '../theme/ThemeProvider';
import { AmbientSurface } from '../design-system/surfaces/Surfaces';
import { getThemeTextStyle } from '../design-system/typography/typeScale';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { plan, charts, intent, themePrompt } = useOrchestration();

  if (!plan || !charts || charts.length === 0) {
    return <Navigate to="/" replace />;
  }

  const titleStyle = getThemeTextStyle(theme, 'subheading');
  const metaStyle = getThemeTextStyle(theme, 'micro');

  return (
    <AmbientSurface>
      {/* Premium Translucent Navigation Header */}
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

      {/* Main Content Area */}
      <main
        style={{
          paddingLeft: theme.spacing.pagePadding,
          paddingRight: theme.spacing.pagePadding,
          paddingTop: '3rem',
          paddingBottom: '3rem',
          maxWidth: theme.layout.maxContentWidth,
          margin: '0 auto',
        }}
      >
        <AdaptiveDashboardRenderer plan={plan} charts={charts} />
      </main>
    </AmbientSurface>
  );
}
