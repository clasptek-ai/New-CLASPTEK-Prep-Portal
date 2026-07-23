import { AggregateRoot } from '@clasptek/kernel';
import { CurriculumCode } from '../value-objects/curriculum-code.vo';
import { CurriculumStatus } from '../value-objects/curriculum-status.vo';

export class Curriculum extends AggregateRoot<string> {
  public versions: any[] = [];

  constructor(
    id: string,
    public readonly code: CurriculumCode,
    public slug: string,
    public name: string,
    public description: string,
    public status: CurriculumStatus = CurriculumStatus.draft(),
    public currentVersionId?: string,
    public currentVersionNo?: string,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public static create(
    id: string,
    code: CurriculumCode,
    name: string,
    description: string
  ): Curriculum {
    const slug = lowerSlug(name);
    return new Curriculum(
      id,
      code,
      slug,
      name,
      description,
      CurriculumStatus.draft(),
      undefined,
      undefined,
      0
    );
  }

  public updateDraft(name: string, description: string): void {
    if (this.status.value !== 'draft') {
      throw new Error('Can only edit curriculum in draft state');
    }
    this.name = name;
    this.description = description;
    this.slug = lowerSlug(name);
    this.updatedAt = new Date();
  }

  public publish(versionId: string, versionNo: string): void {
    this.status = CurriculumStatus.published();
    this.currentVersionId = versionId;
    this.currentVersionNo = versionNo;
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = CurriculumStatus.archived();
    this.updatedAt = new Date();
  }

  public retire(): void {
    this.status = CurriculumStatus.retired();
    this.updatedAt = new Date();
  }
}

function lowerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}
