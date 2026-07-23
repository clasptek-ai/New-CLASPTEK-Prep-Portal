import {
  AssessmentResult,
  VisibilityMode,
  SectionScore,
  SkillScore,
} from '../aggregates/assessment-result.aggregate';

export interface FilteredResultView {
  overallScore: number;
  maxScore: number;
  isPassed: boolean;
  visibilityMode: VisibilityMode;
  sectionScores?: SectionScore[] | undefined;
  skillScores?: SkillScore[] | undefined;
  correctAnswersAvailable?: boolean | undefined;
  fullReviewAvailable?: boolean | undefined;
}

export interface ResultVisibilityStrategy {
  readonly mode: VisibilityMode;
  apply(result: AssessmentResult): FilteredResultView;
}

export class ScoreOnlyStrategy implements ResultVisibilityStrategy {
  public readonly mode: VisibilityMode = 'SCORE_ONLY';
  public apply(result: AssessmentResult): FilteredResultView {
    return {
      overallScore: result.overallScore,
      maxScore: result.maxScore,
      isPassed: result.isPassed,
      visibilityMode: this.mode,
    };
  }
}

export class SectionStrategy implements ResultVisibilityStrategy {
  public readonly mode: VisibilityMode = 'SCORE_SECTIONS';
  public apply(result: AssessmentResult): FilteredResultView {
    return {
      overallScore: result.overallScore,
      maxScore: result.maxScore,
      isPassed: result.isPassed,
      visibilityMode: this.mode,
      sectionScores: result.sectionScores,
      skillScores: result.skillScores,
    };
  }
}

export class CorrectAnswerStrategy implements ResultVisibilityStrategy {
  public readonly mode: VisibilityMode = 'SCORE_CORRECT';
  public apply(result: AssessmentResult): FilteredResultView {
    return {
      overallScore: result.overallScore,
      maxScore: result.maxScore,
      isPassed: result.isPassed,
      visibilityMode: this.mode,
      sectionScores: result.sectionScores,
      skillScores: result.skillScores,
      correctAnswersAvailable: true,
      fullReviewAvailable: false,
    };
  }
}

export class FullReviewStrategy implements ResultVisibilityStrategy {
  public readonly mode: VisibilityMode = 'FULL_REVIEW';
  public apply(result: AssessmentResult): FilteredResultView {
    return {
      overallScore: result.overallScore,
      maxScore: result.maxScore,
      isPassed: result.isPassed,
      visibilityMode: this.mode,
      sectionScores: result.sectionScores,
      skillScores: result.skillScores,
      correctAnswersAvailable: true,
      fullReviewAvailable: true,
    };
  }
}

export class ResultVisibilityFactory {
  public static getStrategy(mode: VisibilityMode): ResultVisibilityStrategy {
    switch (mode) {
      case 'SCORE_ONLY':
        return new ScoreOnlyStrategy();
      case 'SCORE_SECTIONS':
        return new SectionStrategy();
      case 'SCORE_CORRECT':
        return new CorrectAnswerStrategy();
      case 'FULL_REVIEW':
      default:
        return new FullReviewStrategy();
    }
  }
}
