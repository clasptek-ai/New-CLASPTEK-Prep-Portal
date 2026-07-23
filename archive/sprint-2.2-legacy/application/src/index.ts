import { randomUUID } from 'crypto';
import {
  Curriculum,
  CurriculumCode,
  SemanticVersion,
  CurriculumRepository,
  Programme,
  ProgrammeRepository,
  Prerequisite,
  SearchFilters,
} from '@clasptek/domain-curriculum';
import { NotFoundError, ConflictError } from '@clasptek/kernel';

// 1. DTO Command Structures
export interface CreateCurriculumCommand {
  code: string;
  name: string;
  description: string;
}

export interface UpdateCurriculumDraftCommand {
  curriculumId: string;
  expectedVersion: number;
  name: string;
  description: string;
}

export interface CreateCurriculumVersionCommand {
  curriculumId: string;
  expectedVersion: number;
  versionNo: string;
  name: string;
  description?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  breakingChange?: boolean;
  migrationNotes?: string;
}

export interface SubmitCurriculumForReviewCommand {
  curriculumId: string;
  versionId: string;
  expectedVersion: number;
}

export interface ApproveCurriculumVersionCommand {
  curriculumId: string;
  versionId: string;
  expectedVersion: number;
}

export interface PublishCurriculumVersionCommand {
  curriculumId: string;
  versionId: string;
  expectedVersion: number;
  actorId: string;
}

export interface ArchiveCurriculumCommand {
  curriculumId: string;
  expectedVersion: number;
  actorId: string;
}

export interface RestoreCurriculumCommand {
  curriculumId: string;
  expectedVersion: number;
}

export interface DuplicateCurriculumCommand {
  curriculumId: string;
  newCode: string;
  newSlug: string;
  newName: string;
  newDescription?: string;
}

export interface AddProgrammeMappingCommand {
  curriculumId: string;
  versionId: string;
  programmeId: string;
  programmeVersionId: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddPrerequisiteCommand {
  curriculumId: string;
  versionId: string;
  sourceKind: 'Programme' | 'Course' | 'Subject' | 'Module' | 'Competency';
  sourceId: string;
  targetKind: 'Programme' | 'Course' | 'Subject' | 'Module' | 'Competency';
  targetId: string;
  prerequisiteType: 'REQUIRED' | 'RECOMMENDED';
  expectedVersion: number;
}

export interface SetMetadataCommand {
  curriculumId: string;
  versionId: string;
  key: string;
  value: string;
  expectedVersion: number;
}

export interface CreateProgrammeCommand {
  code: string;
  name: string;
  description: string;
  examProductId: string;
}

export interface CreateProgrammeVersionCommand {
  programmeId: string;
  expectedVersion: number;
  versionNo: string;
  name: string;
  description?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  breakingChange?: boolean;
  migrationNotes?: string;
}

export interface PublishProgrammeVersionCommand {
  programmeId: string;
  versionId: string;
  expectedVersion: number;
  actorId: string;
}

export interface AddCourseCommand {
  programmeId: string;
  versionId: string;
  courseId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddSubjectCommand {
  programmeId: string;
  courseId: string;
  subjectId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddModuleCommand {
  programmeId: string;
  subjectId: string;
  moduleId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddCompetencyCommand {
  programmeId: string;
  moduleId: string;
  competencyId?: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddObjectiveCommand {
  programmeId: string;
  competencyId: string;
  objectiveId?: string;
  code: string;
  description: string;
  displayOrder: number;
  expectedVersion: number;
}

export interface AddOutcomeCommand {
  programmeId: string;
  objectiveId: string;
  outcomeId?: string;
  code: string;
  description: string;
  displayOrder: number;
  expectedVersion: number;
}

// 2. Command Handlers
export class CreateCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: CreateCurriculumCommand): Promise<string> {
    const exists = await this.repository.exists(command.code);
    if (exists) {
      throw new ConflictError(`Curriculum with code ${command.code} already exists.`);
    }

    const id = this.repository.nextIdentity();
    const slug = command.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const curriculum = new Curriculum(
      id,
      new CurriculumCode(command.code),
      slug,
      command.name,
      command.description
    );
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
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.name = command.name;
    cur.description = command.description;
    await this.repository.save(cur);
  }
}

export class CreateCurriculumVersionHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: CreateCurriculumVersionCommand): Promise<string> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const versionId = randomUUID();
    const ver = cur.createVersion(
      versionId,
      new SemanticVersion(command.versionNo),
      command.name,
      command.description
    );

    if (command.effectiveFrom) ver.effectiveFrom = new Date(command.effectiveFrom);
    if (command.effectiveUntil) ver.effectiveUntil = new Date(command.effectiveUntil);
    if (command.breakingChange !== undefined) ver.breakingChange = command.breakingChange;
    if (command.migrationNotes) ver.migrationNotes = command.migrationNotes;

    await this.repository.save(cur);
    return versionId;
  }
}

export class SubmitCurriculumForReviewHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: SubmitCurriculumForReviewCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.submitReview(command.versionId);
    await this.repository.save(cur);
  }
}

export class ApproveCurriculumVersionHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: ApproveCurriculumVersionCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.approveVersion(command.versionId);
    await this.repository.save(cur);
  }
}

export class PublishCurriculumVersionHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: PublishCurriculumVersionCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.publishVersion(command.versionId, command.actorId);
    await this.repository.save(cur);
  }
}

export class ArchiveCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: ArchiveCurriculumCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.archive(command.actorId);
    await this.repository.save(cur);
  }
}

export class RestoreCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: RestoreCurriculumCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.restore();
    await this.repository.save(cur);
  }
}

export class DuplicateCurriculumHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: DuplicateCurriculumCommand): Promise<string> {
    const source = await this.repository.findById(command.curriculumId);
    if (!source) {
      throw new NotFoundError(`Source Curriculum with ID ${command.curriculumId} not found.`);
    }

    const exists = await this.repository.exists(command.newCode);
    if (exists) {
      throw new ConflictError(`Curriculum with code ${command.newCode} already exists.`);
    }

    const id = this.repository.nextIdentity();
    const cloned = new Curriculum(
      id,
      new CurriculumCode(command.newCode),
      command.newSlug,
      command.newName,
      command.newDescription || source.description
    );
    await this.repository.save(cloned);
    return id;
  }
}

export class AddProgrammeMappingHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: AddProgrammeMappingCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.addProgrammeMapping(
      command.versionId,
      command.programmeId,
      command.programmeVersionId,
      command.displayOrder
    );
    await this.repository.save(cur);
  }
}

export class AddPrerequisiteHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: AddPrerequisiteCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const prereq: Prerequisite = {
      sourceKind: command.sourceKind,
      sourceId: command.sourceId,
      targetKind: command.targetKind,
      targetId: command.targetId,
      prerequisiteType: command.prerequisiteType,
    };

    cur.addPrerequisite(command.versionId, prereq);
    await this.repository.save(cur);
  }
}

export class SetMetadataHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(command: SetMetadataCommand): Promise<void> {
    const cur = await this.repository.findById(command.curriculumId);
    if (!cur) {
      throw new NotFoundError(`Curriculum with ID ${command.curriculumId} not found.`);
    }

    if (cur.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    cur.setMetadata(command.versionId, command.key, command.value);
    await this.repository.save(cur);
  }
}

// 3. Programme Command Handlers
export class CreateProgrammeHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: CreateProgrammeCommand): Promise<string> {
    const exists = await this.repository.exists(command.code);
    if (exists) {
      throw new ConflictError(`Programme with code ${command.code} already exists.`);
    }

    const id = this.repository.nextIdentity();
    const slug = command.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const programme = new Programme(
      id,
      command.examProductId,
      new CurriculumCode(command.code),
      slug,
      command.name,
      command.description
    );
    await this.repository.save(programme);
    return id;
  }
}

export class CreateProgrammeVersionHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: CreateProgrammeVersionCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const versionId = randomUUID();
    const ver = prog.createVersion(
      versionId,
      new SemanticVersion(command.versionNo),
      command.name,
      command.description
    );

    if (command.effectiveFrom) ver.effectiveFrom = new Date(command.effectiveFrom);
    if (command.effectiveUntil) ver.effectiveUntil = new Date(command.effectiveUntil);
    if (command.breakingChange !== undefined) ver.breakingChange = command.breakingChange;
    if (command.migrationNotes) ver.migrationNotes = command.migrationNotes;

    await this.repository.save(prog);
    return versionId;
  }
}

export class PublishProgrammeVersionHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: PublishProgrammeVersionCommand): Promise<void> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    prog.publishVersion(command.versionId, command.actorId);
    await this.repository.save(prog);
  }
}

export class AddCourseHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddCourseCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const courseId = command.courseId || randomUUID();
    prog.addCourse(
      command.versionId,
      courseId,
      command.name,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return courseId;
  }
}

export class AddSubjectHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddSubjectCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const subjectId = command.subjectId || randomUUID();
    prog.addSubject(
      command.courseId,
      subjectId,
      command.name,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return subjectId;
  }
}

export class AddModuleHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddModuleCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const moduleId = command.moduleId || randomUUID();
    prog.addModule(
      command.subjectId,
      moduleId,
      command.name,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return moduleId;
  }
}

export class AddCompetencyHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddCompetencyCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const competencyId = command.competencyId || randomUUID();
    prog.addCompetency(
      command.moduleId,
      competencyId,
      command.code,
      command.name,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return competencyId;
  }
}

export class AddObjectiveHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddObjectiveCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const objectiveId = command.objectiveId || randomUUID();
    prog.addObjective(
      command.competencyId,
      objectiveId,
      command.code,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return objectiveId;
  }
}

export class AddOutcomeHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(command: AddOutcomeCommand): Promise<string> {
    const prog = await this.repository.findById(command.programmeId);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${command.programmeId} not found.`);
    }

    if (prog.lockVersion !== command.expectedVersion) {
      throw new ConflictError('Concurrency conflict: lock_version mismatch.');
    }

    const outcomeId = command.outcomeId || randomUUID();
    prog.addOutcome(
      command.objectiveId,
      outcomeId,
      command.code,
      command.description,
      command.displayOrder
    );
    await this.repository.save(prog);
    return outcomeId;
  }
}

// 4. Query Handlers
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

export class SearchCurriculaHandler {
  constructor(private readonly repository: CurriculumRepository) {}

  public async execute(filters: SearchFilters): Promise<Curriculum[]> {
    return this.repository.search(filters);
  }
}

export class GetProgrammeHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(id: string): Promise<Programme> {
    const prog = await this.repository.findById(id);
    if (!prog) {
      throw new NotFoundError(`Programme with ID ${id} not found.`);
    }
    return prog;
  }
}

export class SearchProgrammesHandler {
  constructor(private readonly repository: ProgrammeRepository) {}

  public async execute(filters: SearchFilters): Promise<Programme[]> {
    return this.repository.search(filters);
  }
}
