import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';
import { BlueprintPublished } from '../events/BlueprintPublished';

export class AssessmentBlueprintItem {
  constructor(
    public readonly id: string,
    public readonly assessmentBlueprintId: string,
    public readonly assessmentItemTypeId: string,
    public readonly code: string,
    public name: string,
    public difficultyLevelId?: string,
    public cognitiveLevelId?: string,
    public evidenceTypeId?: string,
    public skillGroupId?: string,
    public minimumItemCount?: number,
    public maximumItemCount?: number,
    public targetItemCount?: number,
    public weightPercentage?: number,
    public timeBudgetMinutes?: number,
    public isRequired: boolean = true,
    public status: string = 'ACTIVE'
  ) {}
}

export class AssessmentBlueprintSkillMapping {
  constructor(
    public readonly id: string,
    public readonly assessmentBlueprintItemId: string,
    public readonly skillRevisionId: string,
    public readonly skillLevelId?: string,
    public mappingType: string = 'PRIMARY',
    public importanceWeight: number = 100.00,
    public isPrimary: boolean = true,
    public status: string = 'ACTIVE'
  ) {}
}

export class AssessmentBlueprint extends AggregateRoot<string> {
  private _items: AssessmentBlueprintItem[] = [];
  private _mappings: AssessmentBlueprintSkillMapping[] = [];

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly examProductVersionId: string,
    public readonly officialExamComponentId: string,
    public readonly code: string,
    public name: string,
    public description?: string,
    public blueprintVersion?: string,
    public minimumTotalItems?: number,
    public maximumTotalItems?: number,
    public targetTotalItems?: number,
    public totalWeightPercentage?: number,
    public timeBudgetMinutes?: number,
    public status: string = 'ACTIVE',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get items(): readonly AssessmentBlueprintItem[] {
    return this._items;
  }

  public get mappings(): readonly AssessmentBlueprintSkillMapping[] {
    return this._mappings;
  }

  public addItem(
    id: string,
    itemTypeId: string,
    code: string,
    name: string
  ): AssessmentBlueprintItem {
    if (this._items.some((i) => i.code === code)) {
      throw new DomainError(`Blueprint item ${code} already exists.`);
    }
    const item = new AssessmentBlueprintItem(id, this.id, itemTypeId, code, name);
    this._items.push(item);
    return item;
  }

  public addSkillMapping(
    id: string,
    itemId: string,
    skillRevisionId: string,
    skillLevelId?: string,
    isPrimary: boolean = true
  ): AssessmentBlueprintSkillMapping {
    const mapping = new AssessmentBlueprintSkillMapping(id, itemId, skillRevisionId, skillLevelId, isPrimary ? 'PRIMARY' : 'SECONDARY', 100.00, isPrimary);
    this._mappings.push(mapping);
    return mapping;
  }

  public publish(_actorId: string): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
    this.addDomainEvent({
      blueprintId: this.id,
      examProductVersionId: this.examProductVersionId,
      code: this.code,
      name: this.name,
      occurredAt: this.updatedAt,
    } as BlueprintPublished);
  }

  public loadItems(items: AssessmentBlueprintItem[]): void {
    this._items = items;
  }

  public loadMappings(mappings: AssessmentBlueprintSkillMapping[]): void {
    this._mappings = mappings;
  }
}
