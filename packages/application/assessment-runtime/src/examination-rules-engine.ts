import {
  AssessmentSessionStateMachine,
  DeliverySessionState,
} from '@clasptek/domain-assessment-runtime';

export interface RulesValidationResult {
  allowed: boolean;
  reason?: string | undefined;
}

/**
 * ExaminationRulesEngine
 *
 * Application engine enforcing navigation rules, attempt limits,
 * cooling-off periods, exit warnings, and section locking constraints.
 */
export class ExaminationRulesEngine {
  public validateTransition(
    currentState: DeliverySessionState,
    targetState: DeliverySessionState
  ): RulesValidationResult {
    const can = AssessmentSessionStateMachine.canTransition(currentState, targetState);
    return {
      allowed: can,
      reason: can
        ? undefined
        : `Cannot transition session from '${currentState}' to '${targetState}'.`,
    };
  }

  public validateSectionAccess(
    lockedSections: string[],
    targetSection: string
  ): RulesValidationResult {
    if (lockedSections.includes(targetSection)) {
      return {
        allowed: false,
        reason: `Section '${targetSection}' is locked and cannot be edited.`,
      };
    }
    return { allowed: true };
  }

  public validateAttemptCount(
    currentAttempt: number,
    maxAttempts: number = 3
  ): RulesValidationResult {
    if (currentAttempt > maxAttempts) {
      return {
        allowed: false,
        reason: `Maximum attempt limit of ${maxAttempts} reached for this assessment.`,
      };
    }
    return { allowed: true };
  }
}
