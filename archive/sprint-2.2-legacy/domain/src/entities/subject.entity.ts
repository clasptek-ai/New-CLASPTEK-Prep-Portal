import { Entity } from '@clasptek/kernel';
import { Module } from './module.entity';

export class Subject extends Entity<string> {
  public name: string;
  public description?: string;
  public displayOrder: number;
  public lockVersion: number = 0;
  public modules: Module[] = [];

  constructor(
    id: string,
    public readonly courseId: string,
    name: string,
    displayOrder: number = 0
  ) {
    super(id);
    this.name = name;
    this.displayOrder = displayOrder;
  }
}
