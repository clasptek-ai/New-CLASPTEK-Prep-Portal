import { AggregateRoot } from '@clasptek/kernel';

export class DiagnosticRule {
  constructor(
    public readonly id: string,
    public readonly diagnosticFrameworkId: string,
    public readonly ruleType: string,
    public priority: number = 1,
    public officialExamComponentId?: string,
    public skillRevisionId?: string,
    public skillLevelId?: string,
    public recommendedLearningPathId?: string,
    public operator?: string,
    public minimumValue?: number,
    public maximumValue?: number,
    public weight: number = 1.0,
    public confidenceThreshold?: number,
    public status: string = 'ACTIVE'
  ) {}
}

export class DiagnosticFramework extends AggregateRoot<string> {
  private _rules: DiagnosticRule[] = [];

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly examProductVersionId: string,
    public readonly code: string,
    public name: string,
    public frameworkType: string,
    public description?: string,
    public minimumEvidenceCount?: number,
    public confidenceThreshold?: number,
    public fallbackLearningPathId?: string,
    public status: string = 'ACTIVE',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get rules(): readonly DiagnosticRule[] {
    return this._rules;
  }

  public addRule(id: string, ruleType: string, priority: number = 1): DiagnosticRule {
    const rule = new DiagnosticRule(id, this.id, ruleType, priority);
    this._rules.push(rule);
    return rule;
  }

  public loadRules(rules: DiagnosticRule[]): void {
    this._rules = rules;
  }
}
