import { ValueObject } from '@clasptek/kernel';

export type StageName = 'Foundation' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Ready';

export class LearningStage extends ValueObject<{ stage: StageName }> {
  constructor(stage: StageName) {
    super({ stage });
  }

  get stage(): StageName {
    return this.props.stage;
  }

  public static fromScore(score: number): LearningStage {
    if (score < 40) return new LearningStage('Foundation');
    if (score < 60) return new LearningStage('Beginner');
    if (score < 75) return new LearningStage('Intermediate');
    if (score < 90) return new LearningStage('Advanced');
    return new LearningStage('Exam Ready');
  }
}
