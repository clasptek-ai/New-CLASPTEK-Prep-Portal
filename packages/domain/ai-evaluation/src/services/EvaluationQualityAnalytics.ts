// ═══════════════════════════════════════════════════════════════════
// EVALUATION QUALITY ANALYTICS — AI quality evaluation metrics
// ═══════════════════════════════════════════════════════════════════

export interface EvaluationQualityRecord {
  id: string;
  assessmentType: string;
  skillCode: string;
  timestamp: Date;
  jsonParseFailed: boolean;
  schemaValidationFailed: boolean;
  parserFailed: boolean;
  hallucinationDetected: boolean;
  confidenceScore: number; // 0.0 - 1.0
  latencyMs: number;
}

export interface CalibrationTrendPoint {
  date: Date;
  sessionId: string;
  averageDeviation: number;
  averageConfidence: number;
  compliancePassed: boolean;
}

export interface QualityMetricsSummary {
  assessmentType: string;
  totalEvaluations: number;
  jsonParseFailureRate: number;
  schemaValidationFailureRate: number;
  parserFailureRate: number;
  hallucinationRate: number;
  averageConfidence: number;
  averageLatencyMs: number;
  overallFailureRate: number; // any failure rate
}

export class EvaluationQualityAnalytics {
  /**
   * Aggregates quality records for a specific assessment type.
   */
  public aggregateQuality(
    records: EvaluationQualityRecord[],
    assessmentType?: string
  ): QualityMetricsSummary[] {
    const recordsToUse = assessmentType
      ? records.filter((r) => r.assessmentType === assessmentType)
      : records;

    // Group records by assessmentType
    const grouped = new Map<string, EvaluationQualityRecord[]>();
    for (const r of recordsToUse) {
      const list = grouped.get(r.assessmentType) ?? [];
      list.push(r);
      grouped.set(r.assessmentType, list);
    }

    const summaries: QualityMetricsSummary[] = [];

    for (const [type, groupRecords] of grouped.entries()) {
      const total = groupRecords.length;
      if (total === 0) continue;

      let jsonParseFailures = 0;
      let schemaValidationFailures = 0;
      let parserFailures = 0;
      let hallucinations = 0;
      let sumConfidence = 0;
      let sumLatency = 0;
      let overallFailures = 0;

      for (const r of groupRecords) {
        if (r.jsonParseFailed) jsonParseFailures++;
        if (r.schemaValidationFailed) schemaValidationFailures++;
        if (r.parserFailed) parserFailures++;
        if (r.hallucinationDetected) hallucinations++;

        sumConfidence += r.confidenceScore;
        sumLatency += r.latencyMs;

        if (
          r.jsonParseFailed ||
          r.schemaValidationFailed ||
          r.parserFailed ||
          r.hallucinationDetected
        ) {
          overallFailures++;
        }
      }

      summaries.push({
        assessmentType: type,
        totalEvaluations: total,
        jsonParseFailureRate: jsonParseFailures / total,
        schemaValidationFailureRate: schemaValidationFailures / total,
        parserFailureRate: parserFailures / total,
        hallucinationRate: hallucinations / total,
        averageConfidence: sumConfidence / total,
        averageLatencyMs: sumLatency / total,
        overallFailureRate: overallFailures / total,
      });
    }

    return summaries;
  }

  /**
   * Computes the calibration accuracy trend over time.
   */
  public computeCalibrationTrend(
    historicalSessions: {
      startedAt: Date;
      id: string;
      summary?: {
        averageDeviation: number;
        averageConfidence: number;
        compliancePassed: boolean;
      };
    }[]
  ): CalibrationTrendPoint[] {
    return historicalSessions
      .filter((s) => s.summary !== undefined)
      .map((s) => ({
        date: s.startedAt,
        sessionId: s.id,
        averageDeviation: s.summary!.averageDeviation,
        averageConfidence: s.summary!.averageConfidence,
        compliancePassed: s.summary!.compliancePassed,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
