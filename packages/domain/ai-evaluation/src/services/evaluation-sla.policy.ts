export type SlaType = 'WRITING' | 'SPEAKING' | 'RETRY';

export interface SlaBreachResult {
  isBreached: boolean;
  targetSeconds: number;
  latencySeconds: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class EvaluationSlaPolicy {
  private static readonly SLA_TARGETS: Record<SlaType, number> = {
    WRITING: 120, // 2 minutes
    SPEAKING: 180, // 3 minutes
    RETRY: 300, // 5 minutes
  };

  public evaluateSla(type: SlaType, latencySeconds: number): SlaBreachResult {
    const targetSeconds = EvaluationSlaPolicy.SLA_TARGETS[type];
    const isBreached = latencySeconds > targetSeconds;

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (isBreached) {
      const excessRatio = latencySeconds / targetSeconds;
      if (excessRatio > 2.0) severity = 'CRITICAL';
      else if (excessRatio > 1.5) severity = 'HIGH';
      else severity = 'MEDIUM';
    }

    return {
      isBreached,
      targetSeconds,
      latencySeconds,
      severity,
    };
  }
}
