import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { DashboardPlan } from '../../composer/composerTypes';
import type { ChartConfig } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import AdaptiveCardShell from './AdaptiveCardShell';
import { getThemeTextStyle } from '../../design-system/typography/typeScale';
import {
  buildReflowSpring,
  buildCardVariants,
  buildStaggerContainer,
} from '../../design-system/motion/presets';

// ─── Promoted Hero variant — built dynamically ──────────────────────────────

function buildPromotedHeroVariants(stiffness: number, damping: number): Variants {
  return {
    initial: { opacity: 0, scale: 0.97, y: 40 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: Math.max(100, stiffness - 40),
        damping: Math.max(16, damping - 4),
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

export default function AdaptiveDashboardRenderer({ plan, charts }: AdaptiveDashboardRendererProps) {
  const { theme } = useTheme();

  // Build motion variants from Theme DNA
  const motionDNA = theme.motion;
  const reflowSpring = buildReflowSpring(motionDNA);
  const heroVariants = buildCardVariants(motionDNA, 'hero');
  const primaryVariants = buildCardVariants(motionDNA, 'primary');
  const supportingVariants = buildCardVariants(motionDNA, 'supporting');
  const secondaryVariants = buildCardVariants(motionDNA, 'secondary');
  const promotedVariants = buildPromotedHeroVariants(
    motionDNA.springStiffness ?? 180,
    motionDNA.springDamping ?? 24
  );
  const staggerContainer = buildStaggerContainer(motionDNA);

  // Section header typography from Theme DNA
  const sectionHeaderStyle = getThemeTextStyle(theme, 'micro');

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

  // ── Render Dynamic Row-Based Editorial Layout ─────────────────────────────
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
                <h3
                  className="opacity-40 mb-1"
                  style={{
                    ...sectionHeaderStyle,
                    fontSize: '10px',
                  }}
                >
                  {rowGroup}
                </h3>
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

                    // Choose animation variant from DNA
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

  // ── Fallback: Legacy Section-based Rendering ──────────────────────────────
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
        <h3
          className="opacity-40 mb-2"
          style={sectionHeaderStyle}
        >
          {title}
        </h3>
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