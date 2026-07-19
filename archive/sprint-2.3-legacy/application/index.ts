import {
  Lesson,
  LessonCode,
  SemanticVersion,
  LessonRepository,
  LearningResource,
  ResourceCode,
  LearningResourceRepository,
  LearningResourceSearchFilters
} from '@clasptek/domain-learning-resources';
import { NotFoundError, ConflictError } from '@clasptek/kernel';

// 1. DTO Command & Query Interfaces
export interface CreateLessonCommand {
  moduleId: string;
  code: string;
  name: string;
  description: string;
  displayOrder: number;
}

export interface CreateResourceCommand {
  lessonId: string;
  code: string;
  resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'ARTICLE' | 'MARKDOWN' | 'PRESENTATION' | 'DOWNLOAD' | 'IMAGE' | 'EXERCISE' | 'ASSIGNMENT' | 'EXTERNAL_LINK';
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
}

export interface PublishResourceCommand {
  resourceId: string;
  versionNo: string;
}

export interface PublishLessonCommand {
  lessonId: string;
  versionNo: string;
}

export interface ArchiveResourceCommand {
  resourceId: string;
}

export interface UploadAttachmentCommand {
  resourceId: string;
  versionNo: string;
  attachmentId: string;
  name: string;
  fileSize: number;
  mimeType: string;
  objectKey: string;
}

export interface GenerateTranscriptCommand {
  resourceId: string;
  versionNo: string;
  transcriptId: string;
  transcriptText: string;
  language: string;
}

// 2. Command Handlers
export class CreateLessonHandler {
  constructor(private readonly lessonRepo: LessonRepository) {}

  public async execute(command: CreateLessonCommand): Promise<string> {
    const codeVo = new LessonCode(command.code);
    const exists = await this.lessonRepo.exists(codeVo.value);
    if (exists) {
      throw new ConflictError(`Lesson code ${command.code} already exists.`);
    }

    const id = this.lessonRepo.nextIdentity();
    const lesson = Lesson.create(
      id,
      command.moduleId,
      codeVo,
      command.name,
      command.description,
      command.displayOrder
    );

    await this.lessonRepo.save(lesson);
    return id;
  }
}

export class CreateResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(command: CreateResourceCommand): Promise<string> {
    const codeVo = new ResourceCode(command.code);
    const exists = await this.resourceRepo.exists(codeVo.value);
    if (exists) {
      throw new ConflictError(`Resource code ${command.code} already exists.`);
    }

    const id = this.resourceRepo.nextIdentity();
    const resource = LearningResource.create(
      id,
      command.lessonId,
      codeVo,
      command.resourceType,
      command.slug,
      command.name,
      command.description,
      command.displayOrder
    );

    await this.resourceRepo.save(resource);
    return id;
  }
}

export class PublishResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(command: PublishResourceCommand): Promise<void> {
    const resource = await this.resourceRepo.findById(command.resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource with ID ${command.resourceId} not found.`);
    }

    const versionNoVo = new SemanticVersion(command.versionNo);
    resource.publishVersion(versionNoVo);
    await this.resourceRepo.save(resource);
  }
}

export class PublishLessonHandler {
  constructor(private readonly lessonRepo: LessonRepository) {}

  public async execute(command: PublishLessonCommand): Promise<void> {
    const lesson = await this.lessonRepo.findById(command.lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with ID ${command.lessonId} not found.`);
    }

    const versionNoVo = new SemanticVersion(command.versionNo);
    lesson.publishVersion(versionNoVo);
    await this.lessonRepo.save(lesson);
  }
}

export class ArchiveResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(command: ArchiveResourceCommand): Promise<void> {
    const resource = await this.resourceRepo.findById(command.resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource with ID ${command.resourceId} not found.`);
    }
    resource.archive();
    await this.resourceRepo.save(resource);
  }
}

export class UploadAttachmentHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(command: UploadAttachmentCommand): Promise<void> {
    const resource = await this.resourceRepo.findById(command.resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource with ID ${command.resourceId} not found.`);
    }

    const versionNoVo = new SemanticVersion(command.versionNo);
    resource.addAttachment(
      versionNoVo,
      command.attachmentId,
      command.name,
      command.fileSize,
      command.mimeType,
      command.objectKey
    );
    await this.resourceRepo.save(resource);
  }
}

export class GenerateTranscriptHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(command: GenerateTranscriptCommand): Promise<void> {
    const resource = await this.resourceRepo.findById(command.resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource with ID ${command.resourceId} not found.`);
    }

    const versionNoVo = new SemanticVersion(command.versionNo);
    resource.addTranscript(
      versionNoVo,
      command.transcriptId,
      command.transcriptText,
      command.language
    );
    await this.resourceRepo.save(resource);
  }
}

// 3. Query Handlers
export class SearchLessonsHandler {
  constructor(private readonly lessonRepo: LessonRepository) {}

  public async execute(query: { moduleId?: string }): Promise<Lesson[]> {
    return this.lessonRepo.search(query);
  }
}

export class SearchResourcesHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(query: LearningResourceSearchFilters): Promise<LearningResource[]> {
    return this.resourceRepo.search(query);
  }
}

export class GetLessonHandler {
  constructor(private readonly lessonRepo: LessonRepository) {}

  public async execute(id: string): Promise<Lesson | null> {
    return this.lessonRepo.findById(id);
  }
}

export class GetResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(id: string): Promise<LearningResource | null> {
    return this.resourceRepo.findById(id);
  }
}
