import { Entity } from '@clasptek/kernel';
import { LearningObjective } from './learning-objective.entity';

export class Competency extends Entity<string> {
  public code: string;
  public name: string;
  public description?: string;
  public displayOrder: number;
  public lockVersion: number = 0;
  public objectives: LearningObjective[] = [];

  constructor(
    id: string,
    public readonly moduleId: string,
    code: string,
    name: string,
    displayOrder: number = 0
  ) {
    super(id);
    this.code = code;
    this.name = name;
    this.displayOrder = displayOrder;
  }
}
