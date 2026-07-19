import { randomUUID } from 'crypto';
import {
  Curriculum,
  CurriculumCode,
  CurriculumStatus,
  CurriculumRepository,
  CurriculumVersion,
  CurriculumVersionRepository,
  LearningModule,
  LearningModuleRepository,
  Lesson,
  LessonRepository,
  CurriculumTemplate,
  CurriculumTemplateRepository,
  ConcurrencyError,
  DependencyVersion
} from '@clasptek/domain-curriculum';
import { NotFoundError, ConflictError } from '@clasptek/kernel';

// ==========================================
// 1. Command DTOs
// ==========================================

export interface CreateCurriculumCommand {
  code: string;
  name: string;
  description: string;
}

export interface UpdateCurriculumDraftCommand {
  curriculumId: string;
  name: string;
  description: string;
  expectedVersion: number;
}

export interface CreateCurriculumVersionCommand {
  curriculumId: string;
  versionNo: string;
  name: string;
  description: string;
  breakingChange?: boolean;
  expectedVersion: number;
}

export interface PublishCurriculumVersionCommand {
  curriculumId: string;
  versionId: string;
  expectedVersion: number;
  actorId?: string;
}

export interface AddLearningModuleCommand {
  curriculumVersionId: string;
  code: string;
  name: string;
  description: string;
  moduleType?: string;
  defaultSequenceNo?: number;
  estimatedStudyMinutes?: number;
  isRequired?: boolean;
}

export interface AddLessonCommand {
  learningModuleId: string;
  code: string;
  title: string;
  summary: string;
  lessonType?: string;
  defaultSequenceNo?: number;
  estimatedStudyMinutes?: number;
  isRequired?: boolean;
}

export interface AddLearningOutcomeCommand {
  curriculumVersionId: string;
  code: string;
  statement: string;
  description: string;
  outcomeType?: string;
  minimumMasteryPercentage?: number;
  isMeasurable?: boolean;
}

export interface CreateCurriculumTemplateCommand {
  code: string;
  name: string;
  description: string;
}

// ==========================================
// 2. Command Handlers
// ==========================================

export class CreateCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: CreateCurriculumCommand): Promise<string> {
    const code = new CurriculumCode(command.code);
    const existing = await this.repository.findByCode(code);
    if (existing) {
      throw new ConflictError(`Curriculum with code ${command.code} already exists.`);
    }

    const id = randomUUID();
    const curriculum = Curriculum.create(id, code, command.name, command.description);
    await this.repository.save(curriculum);
    return id;
  }
}

export class UpdateCurriculumDraftHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: UpdateCurriculumDraftCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }

    cur.updateDraft(command.name, command.description);
    cur.lockVersion += 1;
    await this.repository.save(cur);
  }
}

export class CreateCurriculumVersionHandler {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly versionRepository: CurriculumVersionRepository
  ) {}

  public async execute(command: CreateCurriculumVersionCommand): Promise<string> {
    const cur = await this.curriculumRepository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }

    const versionId = randomUUID();
    const version = new CurriculumVersion(
      versionId,
      command.curriculumId,
      new DependencyVersion(command.versionNo),
      'draft',
      command.name,
      command.description,
      undefined,
      undefined,
      undefined,
      command.breakingChange || false
    );

    await this.versionRepository.save(version);
    
    cur.lockVersion += 1;
    await this.curriculumRepository.save(cur);

    return versionId;
  }
}

export class PublishCurriculumVersionHandler {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly versionRepository: CurriculumVersionRepository
  ) {}

  public async execute(command: PublishCurriculumVersionCommand): Promise<void> {
    const cur = await this.curriculumRepository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }

    const ver = await this.versionRepository.findById(command.versionId);
    if (!ver) {
      throw new NotFoundError(`Curriculum version with ID ${command.versionId} not found.`);
    }

    ver.publish();
    await this.versionRepository.save(ver);

    cur.publish(ver.id, ver.versionNo.value);
    cur.lockVersion += 1;
    await this.curriculumRepository.save(cur);
  }
}

export class AddLearningModuleHandler {
  constructor(private readonly repository: LearningModuleRepository) {}

  public async execute(command: AddLearningModuleCommand): Promise<string> {
    const id = randomUUID();
    const slug = command.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    const module = new LearningModule(
      id,
      command.curriculumVersionId,
      command.code,
      slug,
      command.name,
      command.description,
      command.moduleType || 'core',
      command.defaultSequenceNo || 1,
      command.estimatedStudyMinutes || 0,
      command.estimatedStudyMinutes || 0,
      (command.estimatedStudyMinutes || 0) * 2,
      command.isRequired !== undefined ? command.isRequired : true,
      'all_activities',
      'draft'
    );

    await this.repository.save(module);
    return id;
  }
}

export class AddLessonHandler {
  constructor(private readonly repository: LessonRepository) {}

  public async execute(command: AddLessonCommand): Promise<string> {
    const id = randomUUID();
    const slug = command.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    const lesson = new Lesson(
      id,
      command.learningModuleId,
      command.code,
      slug,
      command.title,
      command.summary,
      command.lessonType || 'concept',
      command.defaultSequenceNo || 1,
      command.estimatedStudyMinutes || 0,
      command.estimatedStudyMinutes || 0,
      (command.estimatedStudyMinutes || 0) * 2,
      'text_audio',
      'all_activities',
      command.isRequired !== undefined ? command.isRequired : true,
      'draft'
    );

    await this.repository.save(lesson);
    return id;
  }
}

export class CreateCurriculumTemplateHandler {
  constructor(private readonly repository: CurriculumTemplateRepository) {}

  public async execute(command: CreateCurriculumTemplateCommand): Promise<string> {
    const id = randomUUID();
    const slug = command.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    const template = new CurriculumTemplate(
      id,
      command.code,
      slug,
      command.name,
      command.description,
      'draft'
    );

    await this.repository.save(template);
    return id;
  }
}

export class SubmitCurriculumForReviewHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: { curriculumId: string; versionId: string; expectedVersion: number }): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }
    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }
    cur.status = CurriculumStatus.review();
    cur.lockVersion += 1;
    await this.repository.save(cur);
  }
}

export class ApproveCurriculumVersionHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: { curriculumId: string; versionId: string; expectedVersion: number }): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }
    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }
    // Approve: set status to published
    cur.status = CurriculumStatus.published();
    cur.lockVersion += 1;
    await this.repository.save(cur);
  }
}

export class ArchiveCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: { curriculumId: string; expectedVersion: number; actorId?: string }): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }
    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }
    cur.archive();
    cur.lockVersion += 1;
    await this.repository.save(cur);
  }
}

export class RestoreCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: { curriculumId: string; expectedVersion: number }): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }
    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConcurrencyError();
    }
    cur.status = CurriculumStatus.draft();
    cur.lockVersion += 1;
    await this.repository.save(cur);
  }
}

export class DuplicateCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: { curriculumId: string; newCode: string; newSlug: string; newName: string; newDescription?: string }): Promise<string> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }
    const id = randomUUID();
    const duplicated = Curriculum.create(id, new CurriculumCode(command.newCode), command.newName, command.newDescription || cur.description);
    await this.repository.save(duplicated);
    return id;
  }
}

export class SearchCurriculaHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(filters: any): Promise<Curriculum[]> {
    return this.repository.search(filters);
  }
}

// ==========================================
// 3. Query Handlers & View Projections
// ==========================================

export class GetCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(id: string): Promise<Curriculum> {
    const cur = await this.repository.findById(id);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${id} not found.`);
    }
    return cur;
  }
}

export class GetLessonHandler {
  constructor(private readonly repository: LessonRepository) {}

  public async execute(id: string): Promise<Lesson> {
    const lesson = await this.repository.findById(id);
    if (!lesson) {
      throw new NotFoundError(`Lesson with ID ${id} not found.`);
    }
    return lesson;
  }
}

// Projections Contracts (Read Models)
export interface CurriculumSummaryProjection {
  curriculumId: string;
  code: string;
  name: string;
  description: string;
  status: string;
  currentVersionNo?: string;
  totalModules: number;
  totalLessons: number;
  updatedAt: Date;
}

export interface CurriculumCoverageProjection {
  curriculumVersionId: string;
  totalOutcomesMapped: number;
  outcomesCoveredCount: number;
  skillsFrameworkCoveragePercentage: number;
  examWeightAlignmentScore: number;
  isFullyAligned: boolean;
}

export interface CurriculumPublicationReadinessProjection {
  curriculumVersionId: string;
  validationStatus: 'ready' | 'pending_fixes' | 'in_review';
  blockingErrors: string[];
  circularReferencesCount: number;
  missingTranslationsLanguages: string[];
  dependencyLocksFrozen: boolean;
}

export interface CurriculumGraphProjection {
  curriculumVersionId: string;
  nodesJson: string; // Nodes array of module/lesson vertices
  edgesJson: string; // Edges array of sequences/prerequisites
  longestSequencePathLength: number;
}

export interface LessonTreeProjection {
  curriculumVersionId: string;
  treeJson: string; // Hierarchical tree of version -> modules -> lessons -> activities
}
