import { Entity } from '@clasptek/kernel';
import { Subject } from './subject.entity';

export class Course extends Entity<string> {
  public name: string;
  public description?: string;
  public displayOrder: number;
  public lockVersion: number = 0;
  public subjects: Subject[] = [];

  constructor(
    id: string,
    public readonly programmeVersionId: string,
    name: string,
    displayOrder: number = 0
  ) {
    super(id);
    this.name = name;
    this.displayOrder = displayOrder;
  }
}
