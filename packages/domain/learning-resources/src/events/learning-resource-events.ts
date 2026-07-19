import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseLearningResourceEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class LessonCreated extends BaseLearningResourceEvent {
  constructor(lessonId: string, moduleId: string, code: string) {
    super('LessonCreated', lessonId, { moduleId, code });
  }
}

export class LessonUpdated extends BaseLearningResourceEvent {
  constructor(lessonId: string, name: string, description: string) {
    super('LessonUpdated', lessonId, { name, description });
  }
}

export class LessonPublished extends BaseLearningResourceEvent {
  constructor(lessonId: string, versionNo: string) {
    super('LessonPublished', lessonId, { versionNo });
  }
}

export class LessonArchived extends BaseLearningResourceEvent {
  constructor(lessonId: string) {
    super('LessonArchived', lessonId);
  }
}

export class ResourceVersionCreated extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, versionNo: string) {
    super('ResourceVersionCreated', resourceId, { versionId, versionNo });
  }
}

export class ResourceVersionPublished extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, versionNo: string) {
    super('ResourceVersionPublished', resourceId, { versionId, versionNo });
  }
}

export class ResourceArchived extends BaseLearningResourceEvent {
  constructor(resourceId: string) {
    super('ResourceArchived', resourceId);
  }
}

export class ResourceDownloaded extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, userId: string | null) {
    super('ResourceDownloaded', resourceId, { versionId, userId });
  }
}

export class ResourceViewed extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, userId: string | null) {
    super('ResourceViewed', resourceId, { versionId, userId });
  }
}
