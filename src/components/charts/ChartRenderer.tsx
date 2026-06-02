import type { ChartConfig } from '../../types';
import BarChartCard from './BarChartCard';
import PieChartCard from './PieChartCard';
import LineChartCard from './LineChartCard';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  config: ChartConfig;
  hero?: boolean;
}

/** Dispatches to the correct chart component based on config.type */
export default function ChartRenderer({ config, hero = false }: Props) {
  const { theme } = useTheme();

  switch (config.type) {
    case 'bar':
      return <BarChartCard config={config} hero={hero} />;
    case 'pie':
      return <PieChartCard config={config} hero={hero} />;
    case 'line':
      return <LineChartCard config={config} hero={hero} />;
    default: {
      // Exhaustive type check — TypeScript will warn if a new type is added
      const exhaustive: never = config.type;
      console.warn('Unknown chart type:', exhaustive);
      return (
        <div className="text-sm" style={{ color: theme.colors.textMuted }}>
          Unsupported chart type: {String(exhaustive)}
        </div>
      );
    }
  }
}
