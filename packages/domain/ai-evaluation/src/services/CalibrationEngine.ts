import {
  CalibrationSession,
  CalibrationSummary,
} from '../aggregates/calibration-session.aggregate';

// ═══════════════════════════════════════════════════════════════════
// CALIBRATION ENGINE — Domain service for calibration analysis
// ═══════════════════════════════════════════════════════════════════

export interface CalibrationThresholds {
  maxAverageDeviation: number; // e.g. 0.5 for IELTS
  maxRMSE: number; // e.g. 0.7
  minConfidence: number; // e.g. 0.80
}

export class CalibrationEngine {
  /**
   * Computes the Mean Absolute Error (MAE) of the session overall scores.
   */
  public computeOverallDeviation(session: CalibrationSession): number {
    const results = session.results;
    if (results.length === 0) return 0;
    const sumAbsoluteError = results.reduce((sum, r) => sum + Math.abs(r.error), 0);
    return sumAbsoluteError / results.length;
  }

  /**
   * Computes Root Mean Squared Error (RMSE) for the session.
   */
  public computeRMSE(session: CalibrationSession): number {
    const results = session.results;
    if (results.length === 0) return 0;
    const sumSquaredError = results.reduce((sum, r) => sum + Math.pow(r.error, 2), 0);
    return Math.sqrt(sumSquaredError / results.length);
  }

  /**
   * Computes the Mean Absolute Error (MAE) for a specific rubric criterion.
   */
  public computeCriterionDeviation(session: CalibrationSession, criterionCode: string): number {
    const results = session.results;
    let count = 0;
    let sumAbsoluteError = 0;

    for (const r of results) {
      const expected = r.criteriaExpected[criterionCode];
      const observed = r.criteriaObserved[criterionCode];
      if (expected !== undefined && observed !== undefined) {
        sumAbsoluteError += Math.abs(observed - expected);
        count++;
      }
    }

    return count === 0 ? 0 : sumAbsoluteError / count;
  }

  /**
   * Computes scoring consistency (variance/standard deviation) of the AI provider
   * across multiple calibration sessions of the same prompt/model/dataset.
   */
  public computeConsistency(sessions: CalibrationSession[]): number {
    if (sessions.length < 2) return 0;

    // Group observed scores by itemId
    const scoresByItem = new Map<string, number[]>();
    for (const s of sessions) {
      for (const r of s.results) {
        const list = scoresByItem.get(r.itemId) ?? [];
        list.push(r.observedScore);
        scoresByItem.set(r.itemId, list);
      }
    }

    let totalVariance = 0;
    let itemCount = 0;

    for (const [_, scores] of scoresByItem.entries()) {
      if (scores.length < 2) continue;
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const sumSquaredDiffs = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0);
      const variance = sumSquaredDiffs / (scores.length - 1);
      totalVariance += variance;
      itemCount++;
    }

    return itemCount === 0 ? 0 : Math.sqrt(totalVariance / itemCount); // returns average standard deviation
  }

  /**
   * Computes the average confidence score across all items in a session.
   */
  public computeConfidence(session: CalibrationSession): number {
    const results = session.results;
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  }

  /**
   * Asserts whether a calibration session meets compliance targets.
   */
  public assertCompliance(session: CalibrationSession, thresholds: CalibrationThresholds): boolean {
    const mae = this.computeOverallDeviation(session);
    const rmse = this.computeRMSE(session);
    const confidence = this.computeConfidence(session);

    return (
      mae <= thresholds.maxAverageDeviation &&
      rmse <= thresholds.maxRMSE &&
      confidence >= thresholds.minConfidence
    );
  }

  /**
   * Aggregates all results into a single CalibrationSummary.
   */
  public generateSummary(
    session: CalibrationSession,
    thresholds: CalibrationThresholds,
    additionalMetrics: { totalTokensUsed: number; costUsd: number }
  ): CalibrationSummary {
    const results = session.results;
    const averageDeviation = this.computeOverallDeviation(session);
    const rootMeanSquaredError = this.computeRMSE(session);
    const averageConfidence = this.computeConfidence(session);

    // Compute max deviation
    const maxDeviation = results.reduce((max, r) => Math.max(max, Math.abs(r.error)), 0);

    // Collect all criteria codes
    const criteriaCodes = new Set<string>();
    for (const r of results) {
      Object.keys(r.criteriaExpected).forEach((code) => criteriaCodes.add(code));
    }

    // Compute criterion deviations
    const criterionDeviations: Record<string, number> = {};
    for (const code of criteriaCodes) {
      criterionDeviations[code] = this.computeCriterionDeviation(session, code);
    }

    // Average latency
    const averageLatencyMs =
      results.length === 0 ? 0 : results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;

    const compliancePassed = this.assertCompliance(session, thresholds);

    return new CalibrationSummary({
      averageDeviation,
      maxDeviation,
      rootMeanSquaredError,
      criterionDeviations,
      averageConfidence,
      averageLatencyMs,
      totalTokensUsed: additionalMetrics.totalTokensUsed,
      costUsd: additionalMetrics.costUsd,
      compliancePassed,
    });
  }
}
