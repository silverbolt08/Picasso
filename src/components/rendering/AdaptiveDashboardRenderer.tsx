import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { DashboardPlan } from '../../composer/composerTypes';
import type { ChartConfig } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import AdaptiveCardShell from './AdaptiveCardShell';
import { getThemeTextStyle } from '../../design-system/typography/typeScale';
import {
  buildReflowSpring,
  buildStaggerContainer,
  buildMotionFromPreset,
} from '../../design-system/motion/presets';
import type { SurfaceMode, MotionPreset } from '../../theme/themeTypes';

// ─── Promoted Hero variant — built dynamically ──────────────────────────

function buildPromotedHeroVariants(preset: MotionPreset, motion: any): Variants {
  if (preset === 'none') return { initial: {}, animate: {} };
  if (preset === 'keynote-zoom') {
    return {
      initial: { opacity: 0, scale: 0.9 },
      animate: {
        opacity: 1, scale: 1,
        transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] },
      },
    };
  }
  if (preset === 'editorial-fade') {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } },
    };
  }
  if (preset === 'terminal-scan') {
    return {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'linear' } },
    };
  }
  // Default: spring
  return {
    initial: { opacity: 0, scale: 0.97, y: 40 },
    animate: {
      opacity: 1, scale: 1, y: 0,
      transition: {
        type: 'spring',
        stiffness: Math.max(100, (motion.springStiffness ?? 180) - 40),
        damping: Math.max(16, (motion.springDamping ?? 24) - 4),
        mass: 1.1,
      },
    },
  };
}

interface AdaptiveDashboardRendererProps {
  plan: DashboardPlan | null;
  charts: ChartConfig[];
}

function getGridSpanClass(gridSpan: number): string {
  switch (gridSpan) {
    case 12: return 'col-span-12';
    case 9:  return 'col-span-12 md:col-span-9';
    case 8:  return 'col-span-12 md:col-span-8';
    case 6:  return 'col-span-12 md:col-span-6';
    case 4:  return 'col-span-12 sm:col-span-6 md:col-span-4';
    case 3:  return 'col-span-12 sm:col-span-6 lg:col-span-3';
    default: return 'col-span-12 md:col-span-6';
  }
}

function getRowGroup(rowType: string): string {
  if (rowType === 'hero' || rowType === 'spotlight') {
    return 'Key Analytics Centerpiece';
  } else if (rowType === 'featured') {
    return 'Featured Insight';
  } else if (rowType === 'primary') {
    return 'Primary Analysis';
  } else if (rowType === 'micro' || rowType === 'ambient') {
    return 'Granular Details';
  }
  return 'Supporting Telemetry';
}

// ─── Section Header Renderer ─────────────────────────────────────────────
// Morphs section headers based on surfaceMode.

function SectionHeader({ title, surfaceMode, theme }: { title: string; surfaceMode: SurfaceMode; theme: any }) {
  const baseStyle = getThemeTextStyle(theme, 'micro');

  if (surfaceMode === 'terminal') {
    return (
      <h3
        className="mb-2"
        style={{
          fontFamily: theme.typography.monoFont,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.colors.accentPrimary,
          opacity: 0.7,
        }}
      >
        {'>'} {title.toUpperCase().replace(/ /g, '_')}
        <span
          className="inline-block ml-1"
          style={{
            width: '6px',
            height: '10px',
            backgroundColor: theme.colors.accentPrimary,
            opacity: 0.6,
            animation: 'blink 1s step-end infinite',
          }}
        />
      </h3>
    );
  }

  if (surfaceMode === 'editorial') {
    return (
      <div className="mb-3 flex items-center gap-3">
        <div
          style={{
            width: '24px',
            height: '1px',
            backgroundColor: theme.colors.accentPrimary,
            opacity: 0.4,
          }}
        />
        <h3
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: theme.colors.textSecondary,
            opacity: 0.6,
          }}
        >
          {title}
        </h3>
      </div>
    );
  }

  if (surfaceMode === 'elevated') {
    return (
      <h3
        className="mb-2"
        style={{
          ...baseStyle,
          fontSize: '10px',
          opacity: 0.3,
          color: theme.colors.textMuted,
        }}
      >
        {title}
      </h3>
    );
  }

  // Default
  return (
    <h3
      className="opacity-40 mb-1"
      style={{
        ...baseStyle,
        fontSize: '10px',
      }}
    >
      {title}
    </h3>
  );
}

export default function AdaptiveDashboardRenderer({ plan, charts }: AdaptiveDashboardRendererProps) {
  const { theme } = useTheme();
  const surfaceMode: SurfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';
  const motionPreset: MotionPreset = theme.motion.motionPreset ?? 'spring';

  // Build motion variants from Theme DNA + motion preset
  const motionDNA = theme.motion;
  const reflowSpring = buildReflowSpring(motionDNA);
  const heroVariants = buildMotionFromPreset(motionPreset, motionDNA, 'hero');
  const primaryVariants = buildMotionFromPreset(motionPreset, motionDNA, 'primary');
  const supportingVariants = buildMotionFromPreset(motionPreset, motionDNA, 'supporting');
  const secondaryVariants = buildMotionFromPreset(motionPreset, motionDNA, 'secondary');
  const promotedVariants = buildPromotedHeroVariants(motionPreset, motionDNA);
  const staggerContainer = buildStaggerContainer(motionDNA);

  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4 opacity-30">◻</div>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          No charts to display.
        </p>
        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
          Provide orchestration inputs on the landing page to generate a dashboard.
        </p>
      </div>
    );
  }

  if (!plan || plan.charts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-3xl mb-4 opacity-30 animate-pulse">⬡</div>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Awaiting Composer orchestration...
        </p>
      </div>
    );
  }

  const chartLookup = new Map(charts.map((chart) => [chart.id, chart]));

  // ── Render Dynamic Row-Based Editorial Layout ─────────────────────────
  if (plan.rows && plan.rows.length > 0) {
    return (
      <div className="flex flex-col gap-10 w-full">
        {plan.rows.map((row, idx) => {
          if (row.charts.length === 0) return null;

          const rowGroup = getRowGroup(row.rowType);
          const showHeader = idx === 0 || (idx > 0 && rowGroup !== getRowGroup(plan.rows![idx - 1].rowType));

          return (
            <div key={row.rowId} className="flex flex-col gap-4">
              {showHeader && (
                <SectionHeader title={rowGroup} surfaceMode={surfaceMode} theme={theme} />
              )}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-12 w-full"
                style={{ gap: theme.spacing.gridGap }}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence mode="popLayout">
                  {row.charts.map(c => {
                    const rawChart = chartLookup.get(c.chartId);
                    if (!rawChart) return null;

                    // Choose animation variant from motion preset
                    let variants: Variants;
                    if (c.placement === 'hero' || c.placement === 'spotlight') {
                      variants = c.promotedHero ? promotedVariants : heroVariants;
                    } else if (c.placement === 'primary' || c.placement === 'featured') {
                      variants = primaryVariants;
                    } else if (c.placement === 'supporting') {
                      variants = supportingVariants;
                    } else {
                      variants = secondaryVariants;
                    }

                    const spanClass = getGridSpanClass(c.gridSpan);

                    return (
                      <motion.div
                        key={c.chartId}
                        layout={true}
                        layoutId={c.chartId}
                        variants={variants}
                        transition={reflowSpring}
                        className={spanClass}
                      >
                        <AdaptiveCardShell
                          composed={c}
                          chart={rawChart}
                          layout={c.placement}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Fallback: Legacy Section-based Rendering ──────────────────────────
  const trueHeroes = plan.charts.filter(c => c.placement === 'hero' && !c.promotedHero);
  const primaryCharts = plan.charts.filter(c => c.placement === 'primary');
  const promotedHeroes = plan.charts.filter(c => c.placement === 'hero' && c.promotedHero);
  const supportingCharts = plan.charts.filter(c => c.placement === 'supporting');

  const renderSection = (
    title: string,
    composedCharts: typeof plan.charts,
    layoutClass: string,
    variants: Variants
  ) => {
    if (composedCharts.length === 0) return null;

    return (
      <div className="flex flex-col" style={{ gap: theme.spacing.sectionGap }}>
        <SectionHeader title={title} surfaceMode={surfaceMode} theme={theme} />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 w-full"
          style={{ gap: theme.spacing.gridGap }}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {composedCharts.map(c => {
              const rawChart = chartLookup.get(c.chartId);
              if (!rawChart) return null;

              return (
                <motion.div
                  key={c.chartId}
                  layout={true}
                  layoutId={c.chartId}
                  variants={variants}
                  transition={reflowSpring}
                  className={layoutClass}
                >
                  <AdaptiveCardShell
                    composed={c}
                    chart={rawChart}
                    layout={c.placement}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-12 w-full">
      {renderSection('Key Orchestration Centerpiece', trueHeroes, 'col-span-12', heroVariants)}
      {renderSection('Primary Insights', primaryCharts, 'col-span-12 md:col-span-6', primaryVariants)}
      {renderSection('Featured Insight', promotedHeroes, 'col-span-12', promotedVariants)}
      {renderSection('Supporting Metrics', supportingCharts, 'col-span-12 sm:col-span-6 lg:col-span-4', supportingVariants)}
    </div>
  );
}