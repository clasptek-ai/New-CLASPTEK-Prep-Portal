export interface TimerEvaluationInput {
  allocatedSeconds: number;
  elapsedSeconds: number;
  driftSeconds?: number | undefined;
  maxDriftToleranceSeconds?: number | undefined;
}

export interface TimerEvaluationResult {
  remainingSeconds: number;
  isExpired: boolean;
  isDriftExceeded: boolean;
  effectiveElapsedSeconds: number;
}

/**
 * AssessmentTimerEvaluationPolicy
 *
 * Pure domain policy located in domain layer evaluating remaining time,
 * expiration, drift tolerance, and timeout rules.
 */
export class AssessmentTimerEvaluationPolicy {
  public evaluateTimer(input: TimerEvaluationInput): TimerEvaluationResult {
    const maxDrift = input.maxDriftToleranceSeconds ?? 10;
    const drift = input.driftSeconds ?? 0;
    const isDriftExceeded = Math.abs(drift) > maxDrift;

    const effectiveElapsed = input.elapsedSeconds + (drift > 0 ? drift : 0);
    const remaining = Math.max(0, input.allocatedSeconds - effectiveElapsed);
    const isExpired = remaining === 0;

    return {
      remainingSeconds: remaining,
      isExpired,
      isDriftExceeded,
      effectiveElapsedSeconds: effectiveElapsed,
    };
  }
}
