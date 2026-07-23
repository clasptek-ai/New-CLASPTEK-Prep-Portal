export type VisibilityMode = 'IMMEDIATE' | 'DELAYED' | 'OBJECTIVE_ONLY' | 'HOLD_UNTIL_EVALUATION';

export interface VisibilityResult {
  isVisible: boolean;
  showObjectiveScores: boolean;
  showSubjectiveScores: boolean;
  message: string;
}

export interface ResultVisibilityStrategy {
  readonly mode: VisibilityMode;
  evaluateVisibility(hasPendingSubjective: boolean, releaseDate?: Date): VisibilityResult;
}

export class ImmediateResultsStrategy implements ResultVisibilityStrategy {
  public readonly mode = 'IMMEDIATE';
  public evaluateVisibility(): VisibilityResult {
    return {
      isVisible: true,
      showObjectiveScores: true,
      showSubjectiveScores: true,
      message: 'Full results are immediately available.',
    };
  }
}

export class DelayedResultsStrategy implements ResultVisibilityStrategy {
  public readonly mode = 'DELAYED';
  public evaluateVisibility(_hasPending: boolean, releaseDate?: Date): VisibilityResult {
    const now = new Date();
    const isVisible = releaseDate ? now >= releaseDate : false;
    return {
      isVisible,
      showObjectiveScores: isVisible,
      showSubjectiveScores: isVisible,
      message: isVisible ? 'Results released.' : 'Results delayed until official release date.',
    };
  }
}

export class ObjectiveOnlyResultsStrategy implements ResultVisibilityStrategy {
  public readonly mode = 'OBJECTIVE_ONLY';
  public evaluateVisibility(): VisibilityResult {
    return {
      isVisible: true,
      showObjectiveScores: true,
      showSubjectiveScores: false,
      message: 'Objective scores ready. Subjective evaluation in progress.',
    };
  }
}

export class HoldUntilEvaluationStrategy implements ResultVisibilityStrategy {
  public readonly mode = 'HOLD_UNTIL_EVALUATION';
  public evaluateVisibility(hasPendingSubjective: boolean): VisibilityResult {
    const isVisible = !hasPendingSubjective;
    return {
      isVisible,
      showObjectiveScores: isVisible,
      showSubjectiveScores: isVisible,
      message: isVisible
        ? 'All sections evaluated.'
        : 'Results held until all subjective evaluations complete.',
    };
  }
}

export class ResultVisibilityStrategyFactory {
  public static getStrategy(mode: VisibilityMode): ResultVisibilityStrategy {
    switch (mode) {
      case 'IMMEDIATE':
        return new ImmediateResultsStrategy();
      case 'DELAYED':
        return new DelayedResultsStrategy();
      case 'OBJECTIVE_ONLY':
        return new ObjectiveOnlyResultsStrategy();
      case 'HOLD_UNTIL_EVALUATION':
      default:
        return new HoldUntilEvaluationStrategy();
    }
  }
}
