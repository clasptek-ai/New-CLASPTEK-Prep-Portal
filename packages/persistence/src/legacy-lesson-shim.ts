import { AggregateRoot, Entity, ValueObject } from '@clasptek/kernel';

export class LessonCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error('Lesson code cannot be empty.');
    }
    super({ value: value.trim() });
  }

  public get value(): string {
    return this.props.value;
  }
}

export class LegacySemanticVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string') {
      throw new Error('Version must be a string.');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}

export class ContentBlock extends Entity<string> {
  constructor(
    id: string,
    public readonly lessonVersionId: string,
    public blockType: string,
    public textContent: string,
    public displayOrder: number
  ) {
    super(id);
  }
}

export class LessonVersion extends Entity<string> {
  public contentBlocks: ContentBlock[] = [];

  constructor(
    id: string,
    public readonly lessonId: string,
    public readonly versionNo: LegacySemanticVersion,
    public status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    public name: string,
    public description: string
  ) {
    super(id);
  }

  public addContentBlock(block: ContentBlock) {
    this.contentBlocks.push(block);
  }
}

export class Lesson extends AggregateRoot<string> {
  public versions: LessonVersion[] = [];
  public currentVersionId: string | null = null;

  constructor(
    id: string,
    public readonly moduleId: string,
    public readonly code: LessonCode,
    public name: string,
    public description: string,
    public displayOrder: number,
    public status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public static create(
    id: string,
    moduleId: string,
    code: LessonCode,
    name: string,
    description: string,
    displayOrder: number
  ): Lesson {
    return new Lesson(id, moduleId, code, name, description, displayOrder, 'DRAFT', 0);
  }

  public update(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }

  public createVersion(
    versionId: string,
    versionNo: LegacySemanticVersion,
    name: string,
    description: string
  ): LessonVersion {
    const version = new LessonVersion(versionId, this.id, versionNo, 'DRAFT', name, description);
    this.versions.push(version);
    return version;
  }

  public addContentBlock(
    versionNo: LegacySemanticVersion,
    blockId: string,
    blockType: string,
    textContent: string,
    displayOrder: number
  ) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found.`);
    }
    const block = new ContentBlock(blockId, version.id, blockType, textContent, displayOrder);
    version.addContentBlock(block);
  }

  public publishVersion(versionNo: LegacySemanticVersion) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found.`);
    }

    for (const v of this.versions) {
      if (v.status === 'PUBLISHED') {
        v.status = 'ARCHIVED';
      }
    }

    version.status = 'PUBLISHED';
    this.status = 'PUBLISHED';
    this.currentVersionId = version.id;
    this.updatedAt = new Date();
  }

  public archive() {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  public restore() {
    this.status = 'DRAFT';
    this.updatedAt = new Date();
  }
}

export interface LessonRepository {
  save(lesson: Lesson): Promise<void>;
  findById(id: string): Promise<Lesson | null>;
  findByCode(code: string): Promise<Lesson | null>;
  exists(code: string): Promise<boolean>;
  search(filters: { moduleId?: string }): Promise<Lesson[]>;
  nextIdentity(): string;
}
