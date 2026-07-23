import { AggregateRoot } from '@clasptek/kernel';

export interface SectionAllocation {
  sectionCode: string;
  blueprintSectionId: string;
  questionIds: string[];
  allocatedDurationMinutes: number;
}

export class MockAssessment extends AggregateRoot<string> {
  private _sections: SectionAllocation[] = [];

  constructor(
    id: string,
    public readonly code: string,
    public title: string,
    public examProductId: string,
    public blueprintId: string,
    public status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'LOCKED' | 'ARCHIVED' = 'DRAFT',
    public isLocked: boolean = false,
    public isUnlockedByAdmin: boolean = false,
    public totalDurationMinutes: number = 180,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public get sections(): readonly SectionAllocation[] {
    return this._sections;
  }

  public get totalQuestions(): number {
    return this._sections.reduce((sum, sec) => sum + sec.questionIds.length, 0);
  }

  public static create(
    id: string,
    code: string,
    title: string,
    examProductId: string,
    blueprintId: string,
    totalDurationMinutes: number = 180,
    tenantId?: string
  ): MockAssessment {
    return new MockAssessment(
      id,
      code,
      title,
      examProductId,
      blueprintId,
      'DRAFT',
      false,
      false,
      totalDurationMinutes,
      tenantId
    );
  }

  public allocateSection(allocation: SectionAllocation): void {
    if (this.isLocked) {
      throw new Error(`Cannot modify sections of locked MockAssessment '${this.id}'`);
    }
    const idx = this._sections.findIndex((s) => s.sectionCode === allocation.sectionCode);
    if (idx >= 0) {
      this._sections[idx] = allocation;
    } else {
      this._sections.push(allocation);
    }
    this.updatedAt = new Date();
  }

  public publish(): void {
    if (this._sections.length === 0) {
      throw new Error('Cannot publish MockAssessment with zero allocated sections.');
    }
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public lock(): void {
    this.isLocked = true;
    this.status = 'LOCKED';
    this.updatedAt = new Date();
  }

  public adminUnlock(): void {
    this.isLocked = false;
    this.isUnlockedByAdmin = true;
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }
}
