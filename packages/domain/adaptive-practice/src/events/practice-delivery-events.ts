import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseAdaptiveEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class BookmarkAdded extends BaseAdaptiveEvent {
  constructor(bookmarkId: string, studentId: string, questionId: string) {
    super('BookmarkAdded', bookmarkId, { studentId, questionId });
  }
}

export class BookmarkRemoved extends BaseAdaptiveEvent {
  constructor(bookmarkId: string, studentId: string, questionId: string) {
    super('BookmarkRemoved', bookmarkId, { studentId, questionId });
  }
}

export class WrongAnswerQueued extends BaseAdaptiveEvent {
  constructor(studentId: string, questionId: string, skillId?: string) {
    super('WrongAnswerQueued', studentId, { questionId, skillId });
  }
}

export class WrongAnswerMastered extends BaseAdaptiveEvent {
  constructor(studentId: string, questionId: string) {
    super('WrongAnswerMastered', studentId, { questionId });
  }
}

export class ReviewQueued extends BaseAdaptiveEvent {
  constructor(sessionId: string, questionId: string) {
    super('ReviewQueued', sessionId, { questionId });
  }
}

export class ReviewCompleted extends BaseAdaptiveEvent {
  constructor(sessionId: string, studentId: string) {
    super('ReviewCompleted', sessionId, { studentId });
  }
}

export class PracticeRecommendationGenerated extends BaseAdaptiveEvent {
  constructor(studentId: string, recommendations: string[], isMockReady: boolean) {
    super('PracticeRecommendationGenerated', studentId, { recommendations, isMockReady });
  }
}

export class PracticeReviewed extends BaseAdaptiveEvent {
  constructor(sessionId: string) {
    super('PracticeReviewed', sessionId);
  }
}

export class PracticeRetried extends BaseAdaptiveEvent {
  constructor(sessionId: string, attemptNumber: number) {
    super('PracticeRetried', sessionId, { attemptNumber });
  }
}

export class MockRecommended extends BaseAdaptiveEvent {
  constructor(studentId: string) {
    super('MockRecommended', studentId);
  }
}

export class PracticeCheckpointSaved extends BaseAdaptiveEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('PracticeCheckpointSaved', sessionId, { checkpointVersion });
  }
}

export class PracticeRecovered extends BaseAdaptiveEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('PracticeRecovered', sessionId, { checkpointVersion });
  }
}
