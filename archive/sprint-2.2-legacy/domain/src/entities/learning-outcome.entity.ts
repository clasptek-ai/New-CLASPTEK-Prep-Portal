import { Entity } from '@clasptek/kernel';

export class LearningOutcome extends Entity<string> {
  public code: string;
  public description: string;
  public displayOrder: number;
  public lockVersion: number = 0;

  constructor(
    id: string,
    public readonly learningObjectiveId: string,
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
