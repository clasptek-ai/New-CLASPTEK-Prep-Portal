export type EscalationAction =
  'RETRY' | 'HUMAN_REVIEW' | 'PERMANENT_FAILURE' | 'CANCELLED' | 'TIMED_OUT';

export class FailureEscalationPolicy {
  public determineEscalation(
    attempts: number,
    maxAttempts: number,
    errorType?: string | undefined
  ): EscalationAction {
    if (errorType === 'TIMEOUT') return 'TIMED_OUT';
    if (errorType === 'CANCELLED') return 'CANCELLED';

    if (attempts < maxAttempts) {
      return 'RETRY';
    }

    // Default escalation for ultimate retry failure is Human Review moderation
    return 'HUMAN_REVIEW';
  }
}
