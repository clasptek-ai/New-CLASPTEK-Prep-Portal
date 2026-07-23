import { PracticeSkillScore } from '../aggregates/practice-result.aggregate';

export interface RecommendationRule {
  readonly skillCategory: string;
  readonly thresholdPercentage: number;
  evaluate(skillScore: PracticeSkillScore): string | null;
}

export class GrammarRule implements RecommendationRule {
  public readonly skillCategory = 'Grammar';
  public readonly thresholdPercentage = 60.0;
  public evaluate(skillScore: PracticeSkillScore): string | null {
    if (skillScore.percentage < this.thresholdPercentage) {
      return `Grammar score (${skillScore.percentage}%) is below target threshold (${this.thresholdPercentage}%). Recommend Grammar Practice Set.`;
    }
    return null;
  }
}

export class ReadingRule implements RecommendationRule {
  public readonly skillCategory = 'Reading';
  public readonly thresholdPercentage = 70.0;
  public evaluate(skillScore: PracticeSkillScore): string | null {
    if (skillScore.percentage < this.thresholdPercentage) {
      return `Reading score (${skillScore.percentage}%) is below target threshold (${this.thresholdPercentage}%). Recommend Reading Practice Set.`;
    }
    return null;
  }
}

export class ListeningRule implements RecommendationRule {
  public readonly skillCategory = 'Listening';
  public readonly thresholdPercentage = 65.0;
  public evaluate(skillScore: PracticeSkillScore): string | null {
    if (skillScore.percentage < this.thresholdPercentage) {
      return `Listening score (${skillScore.percentage}%) is below target threshold (${this.thresholdPercentage}%). Recommend Listening Practice Set.`;
    }
    return null;
  }
}

export class WritingRule implements RecommendationRule {
  public readonly skillCategory = 'Writing';
  public readonly thresholdPercentage = 65.0;
  public evaluate(skillScore: PracticeSkillScore): string | null {
    if (skillScore.percentage < this.thresholdPercentage) {
      return `Writing score (${skillScore.percentage}%) is below target threshold (${this.thresholdPercentage}%). Recommend Writing Practice Set.`;
    }
    return null;
  }
}

export class SpeakingRule implements RecommendationRule {
  public readonly skillCategory = 'Speaking';
  public readonly thresholdPercentage = 65.0;
  public evaluate(skillScore: PracticeSkillScore): string | null {
    if (skillScore.percentage < this.thresholdPercentage) {
      return `Speaking score (${skillScore.percentage}%) is below target threshold (${this.thresholdPercentage}%). Recommend Speaking Practice Set.`;
    }
    return null;
  }
}

export class PracticeRecommendationService {
  private rules: RecommendationRule[] = [
    new GrammarRule(),
    new ReadingRule(),
    new ListeningRule(),
    new WritingRule(),
    new SpeakingRule(),
  ];

  public evaluateRecommendations(skillScores: PracticeSkillScore[]): {
    recommendations: string[];
    isMockReady: boolean;
  } {
    const recs: string[] = [];

    for (const score of skillScores) {
      for (const rule of this.rules) {
        if (score.skillName.toLowerCase().includes(rule.skillCategory.toLowerCase())) {
          const rec = rule.evaluate(score);
          if (rec) recs.push(rec);
        }
      }
    }

    const isMockReady = recs.length === 0 && skillScores.length > 0;

    return {
      recommendations: recs,
      isMockReady,
    };
  }
}
