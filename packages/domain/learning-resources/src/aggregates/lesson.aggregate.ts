import { AggregateRoot, Entity } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import { LessonCode, SemanticVersion } from '../value-objects/learning-resource-value-objects';
import {
  LessonCreated,
  LessonUpdated,
  LessonPublished,
  LessonArchived
} from '../events/learning-resource-events';

export class ContentBlock extends Entity<string> {
  constructor(
    id: string,
    public readonly lessonVersionId: string,
    public blockType: string,
    public textContent: string,
    public displayOrder: number
  ) {
    super(id);
    if (!['HEADING', 'PARAGRAPH', 'IMAGE', 'VIDEO', 'CODE', 'QUOTE', 'CHECKLIST', 'TABLE', 'EMBED'].includes(blockType)) {
      throw new DomainError(`Invalid block type: ${blockType}`, 'INVALID_BLOCK_TYPE');
    }
  }
}

export class LessonVersion extends Entity<string> {
  public contentBlocks: ContentBlock[] = [];

  constructor(
    id: string,
    public readonly lessonId: string,
    public readonly versionNo: SemanticVersion,
    public status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    public name: string,
    public description: string
  ) {
    super(id);
  }

  public addContentBlock(block: ContentBlock) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify content blocks of a published version.', 'VERSION_LOCKED');
    }
    // Enforce display order uniqueness
    if (this.contentBlocks.some(b => b.displayOrder === block.displayOrder)) {
      throw new DomainError(`Display order ${block.displayOrder} already exists in version ${this.versionNo.value}.`, 'DUPLICATE_ORDER');
    }
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
    const lesson = new Lesson(id, moduleId, code, name, description, displayOrder, 'DRAFT', 0);
    lesson.addDomainEvent(new LessonCreated(id, moduleId, code.value));
    return lesson;
  }

  public update(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
    this.addDomainEvent(new LessonUpdated(this.id, name, description));
  }

  public createVersion(
    versionId: string,
    versionNo: SemanticVersion,
    name: string,
    description: string
  ): LessonVersion {
    if (this.status === 'ARCHIVED') {
      throw new DomainError('Cannot create version on an archived lesson.', 'LESSON_ARCHIVED');
    }
    if (this.versions.some(v => v.versionNo.value === versionNo.value)) {
      throw new DomainError(`Version ${versionNo.value} already exists.`, 'DUPLICATE_VERSION');
    }
    const version = new LessonVersion(versionId, this.id, versionNo, 'DRAFT', name, description);
    this.versions.push(version);
    return version;
  }

  public addContentBlock(
    versionNo: SemanticVersion,
    blockId: string,
    blockType: string,
    textContent: string,
    displayOrder: number
  ) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) {
      throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    }
    const block = new ContentBlock(blockId, version.id, blockType, textContent, displayOrder);
    version.addContentBlock(block);
  }

  public publishVersion(versionNo: SemanticVersion) {
    if (this.status === 'ARCHIVED') {
      throw new DomainError('Cannot publish an archived lesson.', 'LESSON_ARCHIVED');
    }
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) {
      throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    }

    // Set other versions to ARCHIVED/retired if they were published
    for (const v of this.versions) {
      if (v.status === 'PUBLISHED') {
        v.status = 'ARCHIVED';
      }
    }

    version.status = 'PUBLISHED';
    this.status = 'PUBLISHED';
    this.currentVersionId = version.id;
    this.updatedAt = new Date();

    this.addDomainEvent(new LessonPublished(this.id, versionNo.value));
  }

  public archive() {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
    this.addDomainEvent(new LessonArchived(this.id));
  }

  public restore() {
    this.status = 'DRAFT';
    this.updatedAt = new Date();
  }
}
