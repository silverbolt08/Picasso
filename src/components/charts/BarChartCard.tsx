import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartConfig } from '../../types';
import { formatNumber } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeProvider';
import { getPremiumTooltipStyle } from '../../design-system/effects/effects';

interface Props {
  config: ChartConfig;
  hero?: boolean;
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: { label: string; value: number };
}

export default function BarChartCard({ config, hero = false }: Props) {
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = config.data.map((d) => ({ label: d.label, value: d.value }));
  const height = hero ? 340 : 250;
  const accent = theme.chartStyle.chartAccents.bar;
  const isLight = theme.meta.appearance === 'light';

  // Chart DNA
  const gridlineStyle = theme.chartStyle.gridlineStyle ?? 'dashed';
  const axisVisible = theme.chartStyle.axisVisible ?? false;
  const gradientIntensity = theme.chartStyle.gradientIntensity ?? 0.7;
  const barRadius = theme.chartStyle.barRadius ?? 8;
  const animationDuration = theme.chartStyle.animationDuration ?? 1000;

  // Theme Morphing extensions
  const glowIntensity = theme.chartStyle.glowIntensity ?? 0;
  const axisDensity = theme.chartStyle.axisDensity ?? 'standard';
  const labelStyle = theme.chartStyle.labelStyle ?? 'minimal';

  // Gridline stroke dash array based on DNA
  const gridStrokeDash = gridlineStyle === 'dashed' ? '5 5' : gridlineStyle === 'dotted' ? '2 4' : undefined;

  // Axis tick interval based on axisDensity
  const tickInterval = axisDensity === 'minimal' ? Math.max(1, Math.floor(chartData.length / 3)) 
    : axisDensity === 'dense' ? 0 
    : undefined;

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
          {formatNumber(value)}
        </p>
      </div>
    );
  };

  // Glow filter ID
  const glowFilterId = `bar-glow-${config.title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          barCategoryGap="28%"
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <defs>
            {/* Glow filter for neon/cyberpunk themes */}
            {glowIntensity > 0 && (
              <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={3 * glowIntensity} result="blur" />
                <feComponentTransfer in="blur" result="boost">
                  <feFuncA type="linear" slope={2 * glowIntensity} />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="boost" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
            {chartData.map((_, i) => {
              const color = theme.colors.chartPalette[i % theme.colors.chartPalette.length];
              const gradId = `bar-grad-${config.title.replace(/\s+/g, '-').toLowerCase()}-${i}`;
              return (
                <linearGradient id={gradId} key={i} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={isLight ? 0.85 : 0.95} />
                  <stop offset="100%" stopColor={color} stopOpacity={isLight ? 0.85 - gradientIntensity * 0.5 : 1 - gradientIntensity * 0.7} />
                </linearGradient>
              );
            })}
          </defs>
          {gridlineStyle !== 'none' && (
            <CartesianGrid 
              vertical={axisDensity === 'dense'} 
              stroke={theme.colors.grid} 
              strokeDasharray={gridStrokeDash}
              strokeOpacity={theme.chartStyle.gridOpacity} 
            />
          )}
          <XAxis
            dataKey="label"
            axisLine={axisVisible ? { stroke: theme.colors.grid } : false}
            tickLine={axisVisible && axisDensity === 'dense'}
            dy={10}
            interval={tickInterval}
            hide={labelStyle === 'hidden'}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: 10,
              fontFamily: theme.typography.monoFont,
              fontWeight: 400,
            }}
          />
          <YAxis
            axisLine={axisVisible ? { stroke: theme.colors.grid } : false}
            tickLine={axisVisible && axisDensity === 'dense'}
            tickFormatter={formatNumber}
            dx={-8}
            hide={labelStyle === 'hidden'}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: 10,
              fontFamily: theme.typography.monoFont,
              fontWeight: 400,
            }}
            width={50}
          />
          <Tooltip
            content={(props) => renderTooltipContent(props as unknown as { active?: boolean; payload?: TooltipPayload[] })}
            cursor={false}
          />
          <Bar 
            dataKey="value" 
            radius={[barRadius, barRadius, 0, 0]}
            onMouseLeave={() => setHoveredIndex(null)}
            isAnimationActive={animationDuration > 0}
            animationDuration={animationDuration}
            animationEasing="ease-out"
            filter={glowIntensity > 0 ? `url(#${glowFilterId})` : undefined}
          >
            {chartData.map((_, i) => {
              const gradId = `bar-grad-${config.title.replace(/\s+/g, '-').toLowerCase()}-${i}`;
              const isHoveredCell = hoveredIndex === i;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
              
              return (
                <Cell
                  key={i}
                  fill={gradientIntensity > 0 ? `url(#${gradId})` : theme.colors.chartPalette[i % theme.colors.chartPalette.length]}
                  fillOpacity={isDimmed ? 0.3 : 1.0}
                  onMouseEnter={() => setHoveredIndex(i)}
                  style={{
                    transition: `all ${theme.motion.transitionSpeed} ${theme.motion.easing}`,
                    cursor: 'pointer',
                    filter: isHoveredCell ? 'brightness(1.15) saturate(1.1)' : 'none',
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
