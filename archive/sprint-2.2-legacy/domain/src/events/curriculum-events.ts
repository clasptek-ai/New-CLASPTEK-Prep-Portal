import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  aggregateVersion: number;
  occurredAt: Date;
  correlationId?: string | undefined;
  causationId?: string | undefined;
  actorId?: string | undefined;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseCurriculumEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly aggregateVersion: number,
    public readonly payload: Record<string, any>,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public readonly actorId?: string
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}

// Curriculum-level events
export class CurriculumCreated extends BaseCurriculumEvent {
  constructor(aggregateId: string, payload: { code: string; name: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumCreated', aggregateId, 1, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumUpdated extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: Record<string, any>, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumUpdated', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumVersionCreated extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; versionNo: string; name: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumVersionCreated', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumVersionSuperseded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; supersededByVersionId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumVersionSuperseded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumSubmittedForReview extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumSubmittedForReview', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumApproved extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumApproved', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumPublished extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; publishedBy: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumPublished', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CurriculumArchived extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { archivedBy: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CurriculumArchived', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class PrerequisiteAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; sourceKind: string; sourceId: string; targetKind: string; targetId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('PrerequisiteAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

// Programme-level events
export class ProgrammeCreated extends BaseCurriculumEvent {
  constructor(aggregateId: string, payload: { code: string; name: string; examProductId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('ProgrammeCreated', aggregateId, 1, payload, correlationId, causationId, actorId);
  }
}

export class ProgrammeVersionCreated extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; versionNo: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('ProgrammeVersionCreated', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class ProgrammeVersionPublished extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; publishedBy: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('ProgrammeVersionPublished', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class ProgrammeVersionSuperseded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; supersededByVersionId: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('ProgrammeVersionSuperseded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CourseAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; courseId: string; name: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CourseAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class SubjectAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; courseId: string; subjectId: string; name: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('SubjectAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class ModuleAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; subjectId: string; moduleId: string; name: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('ModuleAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class CompetencyAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; moduleId: string; competencyId: string; name: string; code: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('CompetencyAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class LearningObjectiveAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; competencyId: string; objectiveId: string; code: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('LearningObjectiveAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}

export class LearningOutcomeAdded extends BaseCurriculumEvent {
  constructor(aggregateId: string, aggregateVersion: number, payload: { versionId: string; objectiveId: string; outcomeId: string; code: string }, correlationId?: string, causationId?: string, actorId?: string) {
    super('LearningOutcomeAdded', aggregateId, aggregateVersion, payload, correlationId, causationId, actorId);
  }
}
