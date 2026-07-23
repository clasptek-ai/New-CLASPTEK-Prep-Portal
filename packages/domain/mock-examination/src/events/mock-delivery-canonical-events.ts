export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  payload: Record<string, any>;
  occurredOn: Date;
}

export abstract class BaseMockEvent implements DomainEvent {
  public readonly occurredOn: Date;
  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any>
  ) {
    this.occurredOn = new Date();
  }
}

export class FullscreenExited extends BaseMockEvent {
  constructor(sessionId: string, studentId: string) {
    super('FullscreenExited', sessionId, { studentId });
  }
}

export class BrowserBlurred extends BaseMockEvent {
  constructor(sessionId: string, studentId: string) {
    super('BrowserBlurred', sessionId, { studentId });
  }
}

export class TabSwitched extends BaseMockEvent {
  constructor(sessionId: string, studentId: string) {
    super('TabSwitched', sessionId, { studentId });
  }
}

export class AutoSubmissionTriggered extends BaseMockEvent {
  constructor(sessionId: string, reason: string) {
    super('AutoSubmissionTriggered', sessionId, { reason });
  }
}

export class CheckpointSaved extends BaseMockEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('CheckpointSaved', sessionId, { checkpointVersion });
  }
}

export class CheckpointRestored extends BaseMockEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('CheckpointRestored', sessionId, { checkpointVersion });
  }
}

export class EvaluationQueued extends BaseMockEvent {
  constructor(sessionId: string, questionId: string, sectionType: string) {
    super('EvaluationQueued', sessionId, { questionId, sectionType });
  }
}

export class EvaluationCompleted extends BaseMockEvent {
  constructor(sessionId: string, questionId: string, score: number) {
    super('EvaluationCompleted', sessionId, { questionId, score });
  }
}

export class MockDeliveryStarted extends BaseMockEvent {
  constructor(sessionId: string, studentId: string, templateId: string) {
    super('MockDeliveryStarted', sessionId, { studentId, templateId });
  }
}

export class SectionEntered extends BaseMockEvent {
  constructor(sessionId: string, sectionIndex: number) {
    super('SectionEntered', sessionId, { sectionIndex });
  }
}

export class QuestionAnswered extends BaseMockEvent {
  constructor(sessionId: string, questionId: string, answerPayload: any) {
    super('QuestionAnswered', sessionId, { questionId, answerPayload });
  }
}

export class SectionSubmitted extends BaseMockEvent {
  constructor(sessionId: string, sectionIndex: number) {
    super('SectionSubmitted', sessionId, { sectionIndex });
  }
}

export class IntegrityViolationLogged extends BaseMockEvent {
  constructor(sessionId: string, type: string, details: string) {
    super('IntegrityViolationLogged', sessionId, { type, details });
  }
}

export class SessionAutoLocked extends BaseMockEvent {
  constructor(sessionId: string, warningCount: number) {
    super('SessionAutoLocked', sessionId, { warningCount });
  }
}

export class SubjectiveQueueAdded extends BaseMockEvent {
  constructor(sessionId: string, questionId: string, sectionType: string) {
    super('SubjectiveQueueAdded', sessionId, { questionId, sectionType });
  }
}

export class MockResultGenerated extends BaseMockEvent {
  constructor(resultId: string, sessionId: string, scoreLabel: string) {
    super('MockResultGenerated', resultId, { sessionId, scoreLabel });
  }
}
