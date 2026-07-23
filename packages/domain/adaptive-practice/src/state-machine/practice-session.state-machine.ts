export type PracticeSessionState =
  'LOCKED' | 'AVAILABLE' | 'STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'REVIEWED';

/**
 * PracticeSessionStateMachine
 *
 * Domain state machine validating every practice status transition.
 */
export class PracticeSessionStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<
    PracticeSessionState,
    PracticeSessionState[]
  > = {
    LOCKED: ['AVAILABLE'],
    AVAILABLE: ['STARTED'],
    STARTED: ['IN_PROGRESS', 'SUBMITTED'],
    IN_PROGRESS: ['SUBMITTED', 'COMPLETED'],
    SUBMITTED: ['COMPLETED'],
    COMPLETED: ['REVIEWED', 'STARTED'],
    REVIEWED: ['STARTED'],
  };

  public static canTransition(
    fromState: PracticeSessionState,
    toState: PracticeSessionState
  ): boolean {
    const allowed = PracticeSessionStateMachine.ALLOWED_TRANSITIONS[fromState] || [];
    return allowed.includes(toState);
  }

  public static validateTransition(
    fromState: PracticeSessionState,
    toState: PracticeSessionState
  ): void {
    if (!this.canTransition(fromState, toState)) {
      const allowed = this.ALLOWED_TRANSITIONS[fromState] || [];
      throw new Error(
        `Invalid practice state transition from '${fromState}' to '${toState}'. Allowed: ${allowed.join(', ') || 'None'}`
      );
    }
  }
}
