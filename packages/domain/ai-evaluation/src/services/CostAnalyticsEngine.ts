import { ProviderTelemetry } from '../interfaces/AIProvider';

// ═══════════════════════════════════════════════════════════════════
// COST ANALYTICS ENGINE — Operational telemetry aggregation service
// ═══════════════════════════════════════════════════════════════════

export interface EnrichedTelemetry extends ProviderTelemetry {
  assessmentType: string;
  skillCode: string;
  timestamp: Date;
}

export interface ProviderMetrics {
  provider: string;
  model: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  failureRate: number;
  averageLatencyMs: number;
  averageInputTokens: number;
  averageOutputTokens: number;
  totalCostUsd: number;
}

export interface PeriodCostSummary {
  startDate: Date;
  endDate: Date;
  totalCostUsd: number;
  totalCalls: number;
  costByAssessment: Record<string, number>;
  costByProvider: Record<string, number>;
  metricsByProviderModel: ProviderMetrics[];
}

export class CostAnalyticsEngine {
  /**
   * Aggregates telemetry records into detailed period metrics.
   */
  public aggregatePeriod(
    telemetry: EnrichedTelemetry[],
    startDate: Date,
    endDate: Date
  ): PeriodCostSummary {
    const filtered = telemetry.filter((t) => t.timestamp >= startDate && t.timestamp <= endDate);

    let totalCostUsd = 0;
    const costByAssessment: Record<string, number> = {};
    const costByProvider: Record<string, number> = {};

    // Grouping for provider + model metrics
    const groupedMetrics = new Map<
      string,
      {
        provider: string;
        model: string;
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        totalLatencyMs: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalCostUsd: number;
      }
    >();

    for (const t of filtered) {
      totalCostUsd += t.costUsd;

      // Assessment cost
      costByAssessment[t.assessmentType] = (costByAssessment[t.assessmentType] ?? 0) + t.costUsd;

      // Provider cost
      costByProvider[t.provider] = (costByProvider[t.provider] ?? 0) + t.costUsd;

      // Provider + Model metrics grouping key
      const key = `${t.provider}:${t.model}`;
      const group = groupedMetrics.get(key) ?? {
        provider: t.provider,
        model: t.model,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalLatencyMs: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUsd: 0,
      };

      group.totalCalls++;
      if (t.status === 'COMPLETED') {
        group.successfulCalls++;
      } else {
        group.failedCalls++;
      }
      group.totalLatencyMs += t.latencyMs;
      group.totalInputTokens += t.inputTokens;
      group.totalOutputTokens += t.outputTokens;
      group.totalCostUsd += t.costUsd;

      groupedMetrics.set(key, group);
    }

    const metricsByProviderModel: ProviderMetrics[] = Array.from(groupedMetrics.values()).map(
      (g) => ({
        provider: g.provider,
        model: g.model,
        totalCalls: g.totalCalls,
        successfulCalls: g.successfulCalls,
        failedCalls: g.failedCalls,
        failureRate: g.totalCalls === 0 ? 0 : g.failedCalls / g.totalCalls,
        averageLatencyMs: g.totalCalls === 0 ? 0 : g.totalLatencyMs / g.totalCalls,
        averageInputTokens: g.totalCalls === 0 ? 0 : g.totalInputTokens / g.totalCalls,
        averageOutputTokens: g.totalCalls === 0 ? 0 : g.totalOutputTokens / g.totalCalls,
        totalCostUsd: g.totalCostUsd,
      })
    );

    return {
      startDate,
      endDate,
      totalCostUsd,
      totalCalls: filtered.length,
      costByAssessment,
      costByProvider,
      metricsByProviderModel,
    };
  }

  /**
   * Estimates cost based on token prices.
   */
  public estimateCost(
    inputTokens: number,
    outputTokens: number,
    pricing: { inputTokenPricePerMillion: number; outputTokenPricePerMillion: number }
  ): number {
    const inputCost = (inputTokens / 1_000_000) * pricing.inputTokenPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputTokenPricePerMillion;
    return inputCost + outputCost;
  }
}
