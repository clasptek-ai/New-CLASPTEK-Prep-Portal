import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export class OfficialExamComponent {
  constructor(
    public readonly id: string,
    public readonly officialExamStructureId: string,
    public readonly code: string,
    public name: string,
    public componentType: string,
    public displayOrder: number,
    public parentComponentId?: string,
    public isRequired: boolean = true,
    public isScored: boolean = true,
    public isTimed: boolean = false,
    public durationMinutes?: number,
    public weightPercentage?: number,
    public description?: string,
    public status: string = 'ACTIVE'
  ) {}
}

export class OfficialExamStructure extends AggregateRoot<string> {
  private _components: OfficialExamComponent[] = [];

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly examProductVersionId: string,
    public readonly code: string,
    public name: string,
    public isCurrentOfficialStructure: boolean = false,
    public status: string = 'ACTIVE',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get components(): readonly OfficialExamComponent[] {
    return this._components;
  }

  public addComponent(
    id: string,
    code: string,
    name: string,
    componentType: string,
    displayOrder: number,
    parentComponentId?: string
  ): OfficialExamComponent {
    if (this._components.some((c) => c.code === code)) {
      throw new DomainError(`Component ${code} already exists in structure.`);
    }

    const component = new OfficialExamComponent(
      id,
      this.id,
      code,
      name,
      componentType,
      displayOrder,
      parentComponentId
    );
    this._components.push(component);
    return component;
  }

  public loadComponents(components: OfficialExamComponent[]): void {
    this._components = components;
  }
}
