import { Specification } from '@clasptek/kernel';
import type { AssessmentSession } from '../index';

export class AssessmentEligibilitySpecification extends Specification<AssessmentSession> {
  constructor(
    private readonly maxAttempts: number = 3,
    private readonly currentAttemptCount: number = 1
  ) {
    super();
  }

  public isSatisfiedBy(candidate: AssessmentSession): boolean {
    if (this.currentAttemptCount >= this.maxAttempts) {
      return false;
    }
    const status = candidate.status as string;
    if (status === 'SUBMITTED' || status === 'SUBMITTING' || status === 'EVALUATED') {
      return false;
    }
    return true;
  }
}

export class SubmissionSpecification extends Specification<AssessmentSession> {
  public isSatisfiedBy(candidate: AssessmentSession): boolean {
    const status = candidate.status as string;
    return status === 'ACTIVE' || status === 'RESUMED' || status === 'READY';
  }
}

export class ResumeSpecification extends Specification<AssessmentSession> {
  constructor(public readonly maxPauseCount: number = 5) {
    super();
  }

  public isSatisfiedBy(candidate: AssessmentSession): boolean {
    const status = candidate.status as string;
    if (status !== 'PAUSED') return false;
    return this.maxPauseCount > 0;
  }
}

export class TimerSpecification extends Specification<number> {
  constructor(private readonly maxDriftSeconds: number = 15) {
    super();
  }

  public isSatisfiedBy(driftSeconds: number): boolean {
    return Math.abs(driftSeconds) <= this.maxDriftSeconds;
  }
}
