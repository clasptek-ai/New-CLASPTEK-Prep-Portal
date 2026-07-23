import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseQuestionEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class QuestionCreated extends BaseQuestionEvent {
  constructor(questionId: string, code: string) {
    super('QuestionCreated', questionId, { code });
  }
}

export class QuestionUpdated extends BaseQuestionEvent {
  constructor(questionId: string, changedFields: string[]) {
    super('QuestionUpdated', questionId, { changedFields });
  }
}

export class QuestionDeleted extends BaseQuestionEvent {
  constructor(questionId: string) {
    super('QuestionDeleted', questionId);
  }
}

export class QuestionReviewSubmitted extends BaseQuestionEvent {
  constructor(questionId: string, reviewId: string, reviewerId: string, stage: string) {
    super('QuestionReviewSubmitted', questionId, { reviewId, reviewerId, stage });
  }
}

export class QuestionApproved extends BaseQuestionEvent {
  constructor(questionId: string, approvedBy: string, stage: string) {
    super('QuestionApproved', questionId, { approvedBy, stage });
  }
}

export class QuestionRejected extends BaseQuestionEvent {
  constructor(questionId: string, rejectedBy: string, comments: string) {
    super('QuestionRejected', questionId, { rejectedBy, comments });
  }
}

export class BlueprintValidated extends BaseQuestionEvent {
  constructor(blueprintId: string, isComplete: boolean, warningsCount: number) {
    super('BlueprintValidated', blueprintId, { isComplete, warningsCount });
  }
}

export class PublishingQueued extends BaseQuestionEvent {
  constructor(resourceId: string, resourceType: string, queuedBy: string) {
    super('PublishingQueued', resourceId, { resourceType, queuedBy });
  }
}

export class QuestionPublished extends BaseQuestionEvent {
  constructor(questionId: string, versionId: string, publishedBy: string) {
    super('QuestionPublished', questionId, { versionId, publishedBy });
  }
}

export class QuestionRetired extends BaseQuestionEvent {
  constructor(questionId: string, retiredBy: string, reason: string) {
    super('QuestionRetired', questionId, { retiredBy, reason });
  }
}

export class QuestionDeprecated extends BaseQuestionEvent {
  constructor(questionId: string, deprecatedBy: string) {
    super('QuestionDeprecated', questionId, { deprecatedBy });
  }
}

export class QuestionArchived extends BaseQuestionEvent {
  constructor(questionId: string, archivedBy: string) {
    super('QuestionArchived', questionId, { archivedBy });
  }
}

export class QuestionImported extends BaseQuestionEvent {
  constructor(importId: string, totalImported: number) {
    super('QuestionImported', importId, { totalImported });
  }
}

export class QuestionImportFailed extends BaseQuestionEvent {
  constructor(importId: string, error: string) {
    super('QuestionImportFailed', importId, { error });
  }
}

export class QuestionStatisticsUpdated extends BaseQuestionEvent {
  constructor(questionId: string, versionId: string, facilityIndex: number) {
    super('QuestionStatisticsUpdated', questionId, { versionId, facilityIndex });
  }
}

export class QuestionDifficultyChanged extends BaseQuestionEvent {
  constructor(questionId: string, oldDifficulty: string, newDifficulty: string) {
    super('QuestionDifficultyChanged', questionId, { oldDifficulty, newDifficulty });
  }
}

export class QuestionOwnershipTransferred extends BaseQuestionEvent {
  constructor(questionId: string, oldOwner: string, newOwner: string) {
    super('QuestionOwnershipTransferred', questionId, { oldOwner, newOwner });
  }
}
