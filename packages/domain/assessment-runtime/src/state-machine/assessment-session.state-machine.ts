export type DeliverySessionState =
  | 'CREATED'
  | 'STARTED'
  | 'PAUSED'
  | 'RESUMED'
  | 'SUBMITTED'
  | 'TIMED_OUT'
  | 'EXPIRED'
  | 'ABANDONED';

/**
 * AssessmentSessionStateMachine
 *
 * Domain state machine enforcing valid lifecycle status transitions.
 * Illegal state transitions throw a DomainError.
 */
export class AssessmentSessionStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<
    DeliverySessionState,
    DeliverySessionState[]
  > = {
    CREATED: ['STARTED', 'ABANDONED'],
    STARTED: ['PAUSED', 'SUBMITTED', 'TIMED_OUT', 'EXPIRED', 'ABANDONED'],
    PAUSED: ['RESUMED', 'TIMED_OUT', 'EXPIRED', 'ABANDONED'],
    RESUMED: ['PAUSED', 'SUBMITTED', 'TIMED_OUT', 'EXPIRED', 'ABANDONED'],
    SUBMITTED: [],
    TIMED_OUT: [],
    EXPIRED: [],
    ABANDONED: [],
  };

  public static canTransition(
    fromState: DeliverySessionState,
    toState: DeliverySessionState
  ): boolean {
    const allowed = AssessmentSessionStateMachine.ALLOWED_TRANSITIONS[fromState] || [];
    return allowed.includes(toState);
  }

  public static validateTransition(
    fromState: DeliverySessionState,
    toState: DeliverySessionState
  ): void {
    if (!this.canTransition(fromState, toState)) {
      const allowed = this.ALLOWED_TRANSITIONS[fromState] || [];
      throw new Error(
        `Invalid session state transition from '${fromState}' to '${toState}'. Allowed transitions: ${allowed.join(', ') || 'None'}`
      );
    }
  }
}
