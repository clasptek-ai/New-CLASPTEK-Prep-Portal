export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  payload: Record<string, any>;
}

export interface ExamProductPublishedIntegrationEvent extends IntegrationEvent {
  eventType: 'ExamProductPublishedIntegrationEvent';
  payload: {
    productId: string;
    versionId: string;
    versionNo: string;
    name: string;
    code: string;
    durationMinutes?: number;
    examType?: string;
  };
}

export interface BlueprintPublishedIntegrationEvent extends IntegrationEvent {
  eventType: 'BlueprintPublishedIntegrationEvent';
  payload: {
    blueprintId: string;
    examProductVersionId: string;
    code: string;
    name: string;
    targetTotalItems?: number;
  };
}

export interface SkillRevisionCreatedIntegrationEvent extends IntegrationEvent {
  eventType: 'SkillRevisionCreatedIntegrationEvent';
  payload: {
    skillId: string;
    revisionId: string;
    skillFrameworkVersionId: string;
    revisionNo: number;
    name: string;
    category?: string;
    domain?: string;
  };
}
