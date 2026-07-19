import { Entity } from '@clasptek/kernel';
import { Competency } from './competency.entity';

export class Module extends Entity<string> {
  public name: string;
  public description?: string;
  public displayOrder: number;
  public lockVersion: number = 0;
  public competencies: Competency[] = [];

  constructor(
    id: string,
    public readonly subjectId: string,
    name: string,
    displayOrder: number = 0
  ) {
    super(id);
    this.name = name;
    this.displayOrder = displayOrder;
  }
}
