import { ValueObject } from '@clasptek/kernel';

export type StageName = string;

export class LearningStage extends ValueObject<{ stage: string }> {
  constructor(stage: string) {
    super({ stage });
  }

  get stage(): string {
    return this.props.stage;
  }

  public static fromStageName(stageName: string): LearningStage {
    return new LearningStage(stageName);
  }
}
