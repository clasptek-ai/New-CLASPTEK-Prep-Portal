import { AggregateRoot, Entity } from '@clasptek/kernel';

export interface SkillMapping {
  skillId: string;
  skillCode: string;
  weight: number;
}

export interface BlueprintMapping {
  blueprintId: string;
  sectionCode: string;
  targetCount: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  details: string;
  timestamp: Date;
}

export class QuestionPackageItem extends Entity<string> {
  constructor(
    id: string,
    public readonly questionId: string,
    public questionCode: string,
    public displayOrder: number,
    public isOptional: boolean = false
  ) {
    super(id);
  }
}

/**
 * QuestionPackage
 *
 * Smallest publishable academic unit encapsulating questions, options,
 * explanations, skill mappings, blueprint mappings, difficulty, metadata,
 * version history, and audit trail.
 */
export class QuestionPackage extends AggregateRoot<string> {
  private _items: QuestionPackageItem[] = [];
  private _skillMappings: SkillMapping[] = [];
  private _blueprintMappings: BlueprintMapping[] = [];
  private _auditTrail: AuditLogEntry[] = [];
  private _versions: Array<{ versionNo: number; label: string; publishedAt?: Date }> = [];

  constructor(
    id: string,
    public readonly code: string,
    public title: string,
    public examProductId: string,
    public difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
    public status:
      | 'DRAFT'
      | 'UNDER_REVIEW'
      | 'APPROVED'
      | 'QUEUED'
      | 'PUBLISHED'
      | 'RETIRED'
      | 'ARCHIVED' = 'DRAFT',
    public versionNo: number = 1,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public get items(): readonly QuestionPackageItem[] {
    return this._items;
  }

  public get skillMappings(): readonly SkillMapping[] {
    return this._skillMappings;
  }

  public get blueprintMappings(): readonly BlueprintMapping[] {
    return this._blueprintMappings;
  }

  public get auditTrail(): readonly AuditLogEntry[] {
    return this._auditTrail;
  }

  public get versions(): ReadonlyArray<{ versionNo: number; label: string; publishedAt?: Date }> {
    return this._versions;
  }

  public static create(
    id: string,
    code: string,
    title: string,
    examProductId: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
    tenantId?: string
  ): QuestionPackage {
    const pkg = new QuestionPackage(
      id,
      code,
      title,
      examProductId,
      difficulty,
      'DRAFT',
      1,
      tenantId
    );
    pkg.recordAudit('SYSTEM', 'CREATED', `QuestionPackage ${code} created`);
    return pkg;
  }

  public addItem(item: QuestionPackageItem): void {
    if (this._items.some((i) => i.questionId === item.questionId)) {
      throw new Error(`Question ${item.questionId} already exists in package ${this.id}`);
    }
    this._items.push(item);
    this.updatedAt = new Date();
    this.recordAudit('USER', 'ITEM_ADDED', `Question ${item.questionId} added to package`);
  }

  public removeItem(itemId: string): void {
    this._items = this._items.filter((i) => i.id !== itemId);
    this.updatedAt = new Date();
    this.recordAudit('USER', 'ITEM_REMOVED', `Item ${itemId} removed from package`);
  }

  public addSkillMapping(mapping: SkillMapping): void {
    this._skillMappings.push(mapping);
  }

  public addBlueprintMapping(mapping: BlueprintMapping): void {
    this._blueprintMappings.push(mapping);
  }

  public recordAudit(actorId: string, action: string, details: string): void {
    this._auditTrail.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      action,
      details,
      timestamp: new Date(),
    });
  }

  public publish(publisherId: string): void {
    if (this.status !== 'APPROVED' && this.status !== 'QUEUED') {
      throw new Error(
        `Cannot publish QuestionPackage in status '${this.status}'. Must be APPROVED or QUEUED.`
      );
    }
    if (this._items.length === 0) {
      throw new Error('Cannot publish an empty QuestionPackage.');
    }
    this.status = 'PUBLISHED';
    this._versions.push({
      versionNo: this.versionNo,
      label: `v${this.versionNo}.0`,
      publishedAt: new Date(),
    });
    this.updatedAt = new Date();
    this.recordAudit(
      publisherId,
      'PUBLISHED',
      `QuestionPackage version ${this.versionNo} published`
    );
  }

  public retire(retirerId: string, reason: string): void {
    if (this.status !== 'PUBLISHED') {
      throw new Error(`Cannot retire QuestionPackage in status '${this.status}'`);
    }
    this.status = 'RETIRED';
    this.updatedAt = new Date();
    this.recordAudit(retirerId, 'RETIRED', `Retired: ${reason}`);
  }

  public archive(archiverId: string): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
    this.recordAudit(archiverId, 'ARCHIVED', 'Archived package');
  }
}
