import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartConfig } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { getPremiumTooltipStyle } from '../../design-system/effects/effects';

interface Props {
  config: ChartConfig;
  hero?: boolean;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { label: string; value: number };
}

export default function PieChartCard({ config, hero = false }: Props) {
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = config.data.map((d) => ({ label: d.label, value: d.value, name: d.label }));
  
  const outerRadius = hero ? '88%' : '84%';
  const innerRadius = hero ? '76%' : '72%';
  const height = hero ? 340 : 280;
  const accent = theme.chartStyle.chartAccents.pie;
  const isLight = theme.meta.appearance === 'light';

  // Chart DNA
  const legendPlacement = theme.chartStyle.legendPlacement ?? 'bottom';
  const animationDuration = theme.chartStyle.animationDuration ?? 1000;

  const maxSegment = chartData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    chartData[0]
  );

  const activeSegment = hoveredIndex !== null ? chartData[hoveredIndex] : maxSegment;

  const renderTooltipContent = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (!active || !payload?.length) return null;
    const { label, value } = payload[0].payload;
    const tooltipStyle = getPremiumTooltipStyle(theme, accent);
    
    return (
      <div style={tooltipStyle}>
        <p style={{ color: theme.colors.textSecondary, fontSize: '11px', margin: 0, fontWeight: 500 }}>
          {label}
        </p>
        <p style={{ color: theme.colors.textPrimary, fontSize: '15px', fontWeight: 600, margin: '4px 0 0 0' }}>
          {value}%
        </p>
      </div>
    );
  };

  const renderLegend = ({ payload }: { payload?: readonly { value: string; color?: string }[] }) => {
    if (!payload || legendPlacement === 'none') return null;

    const isRightAligned = legendPlacement === 'right';
    const containerClass = isRightAligned
      ? 'flex flex-col gap-2 max-w-[200px]'
      : 'mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 max-w-md mx-auto';

    return (
      <ul className={containerClass}>
        {payload.map((entry, i: number) => {
          const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
          return (
            <li
              key={i}
              className="flex items-center gap-2"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                color: theme.colors.textSecondary,
                fontSize: '11px',
                fontFamily: theme.typography.bodyFont,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: isDimmed ? 0.35 : 1,
                transition: `opacity ${theme.motion.transitionSpeed} ease`,
              }}
            >
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  // Adjust layout for right-aligned legends
  const legendLayoutProp = legendPlacement === 'right' 
    ? { layout: 'vertical' as const, verticalAlign: 'middle' as const, align: 'right' as const }
    : {};

  return (
    <div style={{ height, width: '100%' }} className="relative flex flex-col justify-center">
      {/* Center Donut Hole KPI Statistic */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" 
        style={{ transform: 'translateY(-22px)' }}
      >
        <span 
          style={{ 
            fontSize: '9px', 
            color: theme.colors.textMuted, 
            fontFamily: theme.typography.metadataFont ?? theme.typography.bodyFont,
            fontWeight: 700,
            textTransform: theme.typography.metadataTransform ?? 'uppercase',
            letterSpacing: '0.1em',
            transition: `color ${theme.motion.transitionSpeed} ease, opacity ${theme.motion.transitionSpeed} ease`,
            opacity: hoveredIndex !== null ? 1.0 : (isLight ? 0.85 : 0.7),
          }}
        >
          {activeSegment.label}
        </span>
        <span 
          style={{ 
            fontSize: hero ? '32px' : '26px', 
            color: hoveredIndex !== null ? theme.colors.accentPrimary : theme.colors.textPrimary, 
            fontFamily: theme.typography.monoFont,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            marginTop: '2px',
            transition: `color ${theme.motion.transitionSpeed} ease, transform ${theme.motion.transitionSpeed} ease`,
            transform: hoveredIndex !== null ? 'scale(1.05)' : 'scale(1)',
            display: 'inline-block',
          }}
        >
          {activeSegment.value}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            stroke={isLight ? theme.colors.cardBackground : 'none'}
            strokeWidth={isLight ? 2 : 0}
            onMouseLeave={() => setHoveredIndex(null)}
            isAnimationActive={animationDuration > 0}
            animationDuration={animationDuration}
          >
            {chartData.map((_, i: number) => {
              const isHoveredCell = hoveredIndex === i;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
              return (
                <Cell
                  key={i}
                  fill={theme.colors.chartPalette[i % theme.colors.chartPalette.length]}
                  fillOpacity={isDimmed ? 0.3 : 0.9}
                  onMouseEnter={() => setHoveredIndex(i)}
                  style={{
                    outline: 'none',
                    transition: `all ${theme.motion.transitionSpeed} ${theme.motion.easing}`,
                    cursor: 'pointer',
                    filter: isHoveredCell ? 'brightness(1.12) saturate(1.05)' : 'none',
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip
            content={(props) => renderTooltipContent(props as unknown as { active?: boolean; payload?: TooltipPayload[] })}
          />
          {legendPlacement !== 'none' && (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            <Legend content={(props: any) => renderLegend(props)} {...legendLayoutProp} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
