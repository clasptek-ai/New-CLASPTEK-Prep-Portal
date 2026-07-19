import { AggregateRoot } from '@clasptek/kernel';
import { ReadinessFrameworkPublished } from '../events/ReadinessFrameworkPublished';

export class ReadinessCriteria {
  constructor(
    public readonly id: string,
    public readonly readinessFrameworkId: string,
    public readonly criterionType: string,
    public priority: number = 1,
    public officialExamComponentId?: string,
    public skillRevisionId?: string,
    public skillLevelId?: string,
    public learningPathId?: string,
    public operator?: string,
    public targetValue?: number,
    public minimumValue?: number,
    public maximumValue?: number,
    public weight: number = 1.00,
    public isMandatory: boolean = true,
    public status: string = 'ACTIVE'
  ) {}
}

export class ReadinessFramework extends AggregateRoot<string> {
  private _criteria: ReadinessCriteria[] = [];

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly examProductVersionId: string,
    public readonly code: string,
    public name: string,
    public description?: string,
    public targetScoreSchemeId?: string,
    public evaluationStrategy?: string,
    public minimumConfidence?: number,
    public status: string = 'ACTIVE',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get criteria(): readonly ReadinessCriteria[] {
    return this._criteria;
  }

  public addCriterion(
    id: string,
    criterionType: string,
    priority: number = 1
  ): ReadinessCriteria {
    const criterion = new ReadinessCriteria(id, this.id, criterionType, priority);
    this._criteria.push(criterion);
    return criterion;
  }

  public publish(_actorId: string): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
    this.addDomainEvent({
      frameworkId: this.id,
      examProductVersionId: this.examProductVersionId,
      code: this.code,
      name: this.name,
      occurredAt: this.updatedAt,
    } as ReadinessFrameworkPublished);
  }

  public loadCriteria(criteria: ReadinessCriteria[]): void {
    this._criteria = criteria;
  }
}
