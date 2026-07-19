import { Entity } from '@clasptek/kernel';
import { LearningOutcome } from './learning-outcome.entity';

export class LearningObjective extends Entity<string> {
  public code: string;
  public description: string;
  public displayOrder: number;
  public lockVersion: number = 0;
  public outcomes: LearningOutcome[] = [];

  constructor(
    id: string,
    public readonly competencyId: string,
    code: string,
    description: string,
    displayOrder: number = 0
  ) {
    super(id);
    this.code = code;
    this.description = description;
    this.displayOrder = displayOrder;
  }
}
