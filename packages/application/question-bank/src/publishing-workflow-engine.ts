import {
  QuestionApproved,
  BlueprintValidated,
  PublishingQueued,
  QuestionPublished,
  QuestionRetired,
  QuestionArchived,
  DomainEvent,
} from '@clasptek/domain-question-bank';

export type LifecycleState =
  | 'DRAFT'
  | 'TECHNICAL_REVIEW'
  | 'ACADEMIC_REVIEW'
  | 'QA'
  | 'APPROVED'
  | 'QUEUED'
  | 'PUBLISHED'
  | 'RETIRED'
  | 'ARCHIVED';

export interface WorkflowTransitionResult {
  previousState: LifecycleState;
  newState: LifecycleState;
  emittedEvents: DomainEvent[];
}

/**
 * PublishingWorkflowEngine
 *
 * Event-driven application engine managing the formal 9-state publishing lifecycle:
 * Draft → Technical Review → Academic Review → QA → Approved → Queued → Published → Retired → Archived.
 */
export class PublishingWorkflowEngine {
  public static readonly ALLOWED_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
    DRAFT: ['TECHNICAL_REVIEW', 'ARCHIVED'],
    TECHNICAL_REVIEW: ['ACADEMIC_REVIEW', 'DRAFT', 'ARCHIVED'],
    ACADEMIC_REVIEW: ['QA', 'TECHNICAL_REVIEW', 'DRAFT', 'ARCHIVED'],
    QA: ['APPROVED', 'ACADEMIC_REVIEW', 'DRAFT', 'ARCHIVED'],
    APPROVED: ['QUEUED', 'PUBLISHED', 'ARCHIVED'],
    QUEUED: ['PUBLISHED', 'APPROVED', 'ARCHIVED'],
    PUBLISHED: ['RETIRED', 'ARCHIVED'],
    RETIRED: ['ARCHIVED'],
    ARCHIVED: ['DRAFT'],
  };

  public transition(
    resourceId: string,
    resourceType: string,
    currentState: LifecycleState,
    targetState: LifecycleState,
    actorId: string,
    notes?: string
  ): WorkflowTransitionResult {
    const allowed = PublishingWorkflowEngine.ALLOWED_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new Error(
        `Invalid lifecycle transition for ${resourceType} '${resourceId}' from '${currentState}' to '${targetState}'. Allowed: ${allowed.join(', ')}`
      );
    }

    const events: DomainEvent[] = [];

    switch (targetState) {
      case 'APPROVED':
        events.push(new QuestionApproved(resourceId, actorId, currentState));
        break;
      case 'QUEUED':
        events.push(new PublishingQueued(resourceId, resourceType, actorId));
        break;
      case 'PUBLISHED':
        events.push(new QuestionPublished(resourceId, '1.0.0', actorId));
        break;
      case 'RETIRED':
        events.push(new QuestionRetired(resourceId, actorId, notes || 'Retired via workflow'));
        break;
      case 'ARCHIVED':
        events.push(new QuestionArchived(resourceId, actorId));
        break;
    }

    return {
      previousState: currentState,
      newState: targetState,
      emittedEvents: events,
    };
  }

  public validateBlueprint(
    blueprintId: string,
    isComplete: boolean,
    warningsCount: number
  ): DomainEvent[] {
    return [new BlueprintValidated(blueprintId, isComplete, warningsCount)];
  }
}
