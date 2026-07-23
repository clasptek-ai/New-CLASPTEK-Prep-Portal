export type FeedbackMode = 'IMMEDIATE' | 'DEFERRED' | 'EXPLANATION_ONLY' | 'CORRECT_ANSWER_ONLY';

export interface FeedbackOutput {
  isCorrect: boolean;
  correctOptionIds?: string[];
  explanation?: string;
  referencedLessonId?: string;
}

export interface FeedbackStrategy {
  readonly mode: FeedbackMode;
  evaluate(
    isCorrect: boolean,
    correctOptionIds: string[],
    explanation?: string,
    lessonId?: string
  ): FeedbackOutput;
}

export class ImmediateFeedbackStrategy implements FeedbackStrategy {
  public readonly mode: FeedbackMode = 'IMMEDIATE';
  public evaluate(
    isCorrect: boolean,
    correctOptionIds: string[],
    explanation?: string,
    lessonId?: string
  ): FeedbackOutput {
    const out: FeedbackOutput = { isCorrect, correctOptionIds };
    if (explanation) out.explanation = explanation;
    if (lessonId) out.referencedLessonId = lessonId;
    return out;
  }
}

export class DeferredFeedbackStrategy implements FeedbackStrategy {
  public readonly mode: FeedbackMode = 'DEFERRED';
  public evaluate(isCorrect: boolean): FeedbackOutput {
    return {
      isCorrect,
    };
  }
}

export class ExplanationOnlyStrategy implements FeedbackStrategy {
  public readonly mode: FeedbackMode = 'EXPLANATION_ONLY';
  public evaluate(
    isCorrect: boolean,
    _correctOptionIds: string[],
    explanation?: string
  ): FeedbackOutput {
    const out: FeedbackOutput = { isCorrect };
    if (explanation) out.explanation = explanation;
    return out;
  }
}

export class CorrectAnswerOnlyStrategy implements FeedbackStrategy {
  public readonly mode: FeedbackMode = 'CORRECT_ANSWER_ONLY';
  public evaluate(isCorrect: boolean, correctOptionIds: string[]): FeedbackOutput {
    return {
      isCorrect,
      correctOptionIds,
    };
  }
}

export class FeedbackStrategyFactory {
  public static getStrategy(mode: FeedbackMode): FeedbackStrategy {
    switch (mode) {
      case 'IMMEDIATE':
        return new ImmediateFeedbackStrategy();
      case 'DEFERRED':
        return new DeferredFeedbackStrategy();
      case 'EXPLANATION_ONLY':
        return new ExplanationOnlyStrategy();
      case 'CORRECT_ANSWER_ONLY':
      default:
        return new CorrectAnswerOnlyStrategy();
    }
  }
}
