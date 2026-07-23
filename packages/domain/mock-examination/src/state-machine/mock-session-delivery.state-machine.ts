export type MockDeliveryState =
  | 'AVAILABLE'
  | 'UNLOCKED'
  | 'STARTED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'RESUMED'
  | 'SECTION_SUBMITTED'
  | 'COMPLETED'
  | 'REVIEWED'
  | 'ARCHIVED';

export class MockSessionDeliveryStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<MockDeliveryState, MockDeliveryState[]> = {
    AVAILABLE: ['UNLOCKED'],
    UNLOCKED: ['STARTED'],
    STARTED: ['IN_PROGRESS'],
    IN_PROGRESS: ['PAUSED', 'SECTION_SUBMITTED', 'COMPLETED'],
    PAUSED: ['RESUMED'],
    RESUMED: ['IN_PROGRESS', 'SECTION_SUBMITTED', 'COMPLETED'],
    SECTION_SUBMITTED: ['IN_PROGRESS', 'COMPLETED'],
    COMPLETED: ['REVIEWED', 'ARCHIVED'],
    REVIEWED: ['ARCHIVED'],
    ARCHIVED: [],
  };

  public static canTransition(from: MockDeliveryState, to: MockDeliveryState): boolean {
    const allowed = MockSessionDeliveryStateMachine.ALLOWED_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static validateTransition(from: MockDeliveryState, to: MockDeliveryState): void {
    if (!this.canTransition(from, to)) {
      const allowed = MockSessionDeliveryStateMachine.ALLOWED_TRANSITIONS[from] || [];
      throw new Error(
        `Invalid mock delivery state transition from '${from}' to '${to}'. Allowed: ${allowed.join(', ') || 'None'}`
      );
    }
  }
}
