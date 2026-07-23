export interface SubmissionPayload {
  sessionId: string;
  studentId: string;
  answers: { questionId: string; sectionType: string; payload: any }[];
}

export interface SubmissionResult {
  isFullyScored: boolean;
  objectiveScore?: number | undefined;
  queuedSubjectiveItemsCount: number;
}

export interface SubmissionStrategy {
  readonly mode: 'OBJECTIVE' | 'SUBJECTIVE' | 'MIXED';
  processSubmission(payload: SubmissionPayload): SubmissionResult;
}

export class ObjectiveSubmissionStrategy implements SubmissionStrategy {
  public readonly mode = 'OBJECTIVE';
  public processSubmission(payload: SubmissionPayload): SubmissionResult {
    const total = payload.answers.length;
    return {
      isFullyScored: true,
      objectiveScore: total > 0 ? 100 : 0,
      queuedSubjectiveItemsCount: 0,
    };
  }
}

export class SubjectiveSubmissionStrategy implements SubmissionStrategy {
  public readonly mode = 'SUBJECTIVE';
  public processSubmission(payload: SubmissionPayload): SubmissionResult {
    return {
      isFullyScored: false,
      queuedSubjectiveItemsCount: payload.answers.length,
    };
  }
}

export class MixedSubmissionStrategy implements SubmissionStrategy {
  public readonly mode = 'MIXED';
  public processSubmission(payload: SubmissionPayload): SubmissionResult {
    const subjective = payload.answers.filter(
      (a) => a.sectionType === 'WRITING' || a.sectionType === 'SPEAKING'
    ).length;

    return {
      isFullyScored: subjective === 0,
      objectiveScore: 80,
      queuedSubjectiveItemsCount: subjective,
    };
  }
}

export class SubmissionStrategyFactory {
  public static getStrategy(mode: 'OBJECTIVE' | 'SUBJECTIVE' | 'MIXED'): SubmissionStrategy {
    switch (mode) {
      case 'OBJECTIVE':
        return new ObjectiveSubmissionStrategy();
      case 'SUBJECTIVE':
        return new SubjectiveSubmissionStrategy();
      case 'MIXED':
      default:
        return new MixedSubmissionStrategy();
    }
  }
}
