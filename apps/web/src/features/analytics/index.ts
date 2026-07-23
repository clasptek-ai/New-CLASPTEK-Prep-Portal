import { clientWidgetRegistry } from './WidgetRegistry';
import { KpiCardWidget } from './KpiCardWidget';
import { TrendChartWidget } from './TrendChartWidget';
import { HeatmapWidget } from './HeatmapWidget';
import { ExecutiveInsightWidget } from './ExecutiveInsightWidget';

// Register widget components with clientWidgetRegistry
clientWidgetRegistry.register('KPI_CARD', KpiCardWidget);
clientWidgetRegistry.register('TREND_CHART', TrendChartWidget);
clientWidgetRegistry.register('HEATMAP', HeatmapWidget);
clientWidgetRegistry.register('EXECUTIVE_INSIGHT', ExecutiveInsightWidget);

export {
  clientWidgetRegistry,
  KpiCardWidget,
  TrendChartWidget,
  HeatmapWidget,
  ExecutiveInsightWidget,
};
