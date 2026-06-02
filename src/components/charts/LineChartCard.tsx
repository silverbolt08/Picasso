import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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
  payload: { label: string; value: number };
}

export default function LineChartCard({ config, hero = false }: Props) {
  const { theme } = useTheme();
  const chartData = config.data.map((d) => ({ label: d.label, value: d.value }));
  const height = hero ? 340 : 250;
  const gradId = `line-grad-${config.title.replace(/\s+/g, '-').toLowerCase()}`;
  const glowId = `glow-${config.title.replace(/\s+/g, '-').toLowerCase()}`;
  const accent = theme.chartStyle.chartAccents.line;
  const isLight = theme.meta.appearance === 'light';

  // Chart DNA
  const gridlineStyle = theme.chartStyle.gridlineStyle ?? 'dashed';
  const axisVisible = theme.chartStyle.axisVisible ?? false;
  const gradientIntensity = theme.chartStyle.gradientIntensity ?? 0.7;
  const areaOpacity = theme.chartStyle.areaOpacity ?? 0.25;
  const dotStyle = theme.chartStyle.dotStyle ?? 'circle';
  const animationDuration = theme.chartStyle.animationDuration ?? 1200;
  const lineThickness = theme.chartStyle.lineThickness ?? 3;

  const gridStrokeDash = gridlineStyle === 'dashed' ? '5 5' : gridlineStyle === 'dotted' ? '2 4' : undefined;

  // Dot shape based on DNA
  const getDotProps = (isActive: boolean) => {
    if (dotStyle === 'none') return false;
    const baseRadius = isActive ? 7 : 4;
    if (dotStyle === 'square') {
      // Recharts doesn't natively support square dots, so we use larger radius with sharp edges
      return { fill: isActive ? accent : theme.colors.surface, stroke: accent, strokeWidth: 2, r: baseRadius };
    }
    if (dotStyle === 'diamond') {
      return { fill: isActive ? accent : theme.colors.surface, stroke: accent, strokeWidth: 2, r: baseRadius };
    }
    return { fill: isActive ? accent : theme.colors.surface, stroke: accent, strokeWidth: 2, r: baseRadius };
  };

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

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <defs>
            {/* Volumetric Glow Filter — suppressed for flat/minimal themes */}
            {!isLight && theme.cardStyle.elevationModel !== 'flat' && (
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComponentTransfer in="blur" result="boost">
                  <feFuncA type="linear" slope="1.8"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="boost" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}

            {/* Smooth Fill Gradient — intensity controlled by DNA */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accent} stopOpacity={areaOpacity * gradientIntensity} />
              <stop offset="95%" stopColor={accent} stopOpacity={0.00} />
            </linearGradient>
          </defs>

          {gridlineStyle !== 'none' && (
            <CartesianGrid 
              vertical={false} 
              stroke={theme.colors.grid} 
              strokeDasharray={gridStrokeDash}
              strokeOpacity={theme.chartStyle.gridOpacity} 
            />
          )}

          <XAxis
            dataKey="label"
            axisLine={axisVisible ? { stroke: theme.colors.grid } : false}
            tickLine={false}
            dy={10}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: 10,
              fontFamily: theme.typography.monoFont,
              fontWeight: 400,
            }}
          />

          <YAxis
            axisLine={axisVisible ? { stroke: theme.colors.grid } : false}
            tickLine={false}
            tickFormatter={formatNumber}
            dx={-8}
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
          />

          {/* Background Volumetric Glow Trail — suppressed in Light mode and flat themes */}
          {!isLight && theme.cardStyle.elevationModel !== 'flat' && (
            <Area
              type="monotone"
              dataKey="value"
              stroke={accent}
              strokeWidth={lineThickness + 4}
              strokeOpacity={0.4}
              fill="none"
              filter={`url(#${glowId})`}
              activeDot={false}
              dot={false}
              legendType="none"
              isAnimationActive={animationDuration > 0}
              animationDuration={animationDuration * 1.25}
              animationEasing="ease-out"
            />
          )}

          {/* Crisp Foreground Line & Gradient Area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={lineThickness}
            fill={areaOpacity > 0 ? `url(#${gradId})` : 'none'}
            dot={getDotProps(false)}
            activeDot={getDotProps(true)}
            isAnimationActive={animationDuration > 0}
            animationDuration={animationDuration}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
