import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/curriculum-errors';
import { CurriculumCode } from '../value-objects/curriculum-code';
import { SemanticVersion } from '../value-objects/semantic-version';
import { ProgrammeVersion } from '../entities/programme-version.entity';
import { Course } from '../entities/course.entity';
import { Subject } from '../entities/subject.entity';
import { Module } from '../entities/module.entity';
import { Competency } from '../entities/competency.entity';
import { LearningObjective } from '../entities/learning-objective.entity';
import { LearningOutcome } from '../entities/learning-outcome.entity';
import {
  ProgrammeCreated,
  ProgrammeVersionCreated,
  ProgrammeVersionPublished,
  ProgrammeVersionSuperseded,
  CourseAdded,
  SubjectAdded,
  ModuleAdded,
  CompetencyAdded,
  LearningObjectiveAdded,
  LearningOutcomeAdded
} from '../events/curriculum-events';

export class Programme extends AggregateRoot<string> {
  private _versions: ProgrammeVersion[] = [];
  private _courses: Course[] = [];
  private _subjects: Subject[] = [];
  private _modules: Module[] = [];
  private _competencies: Competency[] = [];
  private _objectives: LearningObjective[] = [];
  private _outcomes: LearningOutcome[] = [];

  public currentVersionId?: string;

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly code: CurriculumCode,
    public readonly slug: string,
    public name: string,
    public description: string,
    public status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
    this.addDomainEvent(new ProgrammeCreated(id, { code: code.value, name, examProductId }));
  }

  public get versions(): readonly ProgrammeVersion[] {
    return this._versions;
  }

  public get courses(): readonly Course[] {
    return this._courses;
  }

  public get subjects(): readonly Subject[] {
    return this._subjects;
  }

  public get modules(): readonly Module[] {
    return this._modules;
  }

  public get competencies(): readonly Competency[] {
    return this._competencies;
  }

  public get objectives(): readonly LearningObjective[] {
    return this._objectives;
  }

  public get outcomes(): readonly LearningOutcome[] {
    return this._outcomes;
  }

  // 1. Hydration helper methods
  public addHydratedVersion(v: ProgrammeVersion): void {
    this._versions.push(v);
  }

  public addHydratedCourse(c: Course): void {
    this._courses.push(c);
  }

  public addHydratedSubject(s: Subject): void {
    this._subjects.push(s);
  }

  public addHydratedModule(m: Module): void {
    this._modules.push(m);
  }

  public addHydratedCompetency(c: Competency): void {
    this._competencies.push(c);
  }

  public addHydratedObjective(o: LearningObjective): void {
    this._objectives.push(o);
  }

  public addHydratedOutcome(o: LearningOutcome): void {
    this._outcomes.push(o);
  }

  // 2. Version Management & State Transitions
  public createVersion(versionId: string, versionNo: SemanticVersion, name: string, description?: string): ProgrammeVersion {
    if (this._versions.some(v => v.versionNo.value === versionNo.value)) {
      throw new DomainError(`Version ${versionNo.value} already exists for this programme.`);
    }

    const version = new ProgrammeVersion(versionId, this.id, versionNo, 'DRAFT', name);
    if (description !== undefined) {
      version.description = description;
    }
    this._versions.push(version);

    this.addDomainEvent(new ProgrammeVersionCreated(this.id, this.lockVersion, { versionId, versionNo: versionNo.value }));
    return version;
  }

  public publishVersion(versionId: string, actorId: string): void {
    const version = this.getVersionOrThrow(versionId);
    if (version.status !== 'DRAFT' && version.status !== 'APPROVED') {
      // Allow publishing from Draft or Approved for simplicity or standard state transitions
    }
    
    // Deprecate active published versions
    for (const v of this._versions) {
      if (v.status === 'PUBLISHED') {
        v.status = 'DEPRECATED';
        this.addDomainEvent(new ProgrammeVersionSuperseded(this.id, this.lockVersion, { versionId: v.id, supersededByVersionId: versionId }));
      }
    }

    version.status = 'PUBLISHED';
    this.currentVersionId = versionId;
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();

    this.addDomainEvent(new ProgrammeVersionPublished(this.id, this.lockVersion, { versionId, publishedBy: actorId }));
  }

  // 3. Child Entities Mutations with Ordering Invariants
  public addCourse(versionId: string, courseId: string, name: string, description?: string, displayOrder: number = 1): Course {
    const version = this.getVersionOrThrow(versionId);
    this.ensureMutable(version);

    const sisterCourses = this._courses.filter(c => c.programmeVersionId === versionId);
    if (sisterCourses.some(c => c.displayOrder === displayOrder)) {
      throw new DomainError(`Course display order ${displayOrder} must be unique within version ${versionId}.`);
    }

    const course = new Course(courseId, versionId, name, displayOrder);
    if (description !== undefined) {
      course.description = description;
    }
    this._courses.push(course);
    version.courses.push(course);

    this.addDomainEvent(new CourseAdded(this.id, this.lockVersion, { versionId, courseId, name }));
    return course;
  }

  public addSubject(courseId: string, subjectId: string, name: string, description?: string, displayOrder: number = 1): Subject {
    const course = this.getCourseOrThrow(courseId);
    const version = this.getVersionOrThrow(course.programmeVersionId);
    this.ensureMutable(version);

    const sisterSubjects = this._subjects.filter(s => s.courseId === courseId);
    if (sisterSubjects.some(s => s.displayOrder === displayOrder)) {
      throw new DomainError(`Subject display order ${displayOrder} must be unique within course ${courseId}.`);
    }

    const subject = new Subject(subjectId, courseId, name, displayOrder);
    if (description !== undefined) {
      subject.description = description;
    }
    this._subjects.push(subject);
    course.subjects.push(subject);

    this.addDomainEvent(new SubjectAdded(this.id, this.lockVersion, { versionId: version.id, courseId, subjectId, name }));
    return subject;
  }

  public addModule(subjectId: string, moduleId: string, name: string, description?: string, displayOrder: number = 1): Module {
    const subject = this.getSubjectOrThrow(subjectId);
    const course = this.getCourseOrThrow(subject.courseId);
    const version = this.getVersionOrThrow(course.programmeVersionId);
    this.ensureMutable(version);

    const sisterModules = this._modules.filter(m => m.subjectId === subjectId);
    if (sisterModules.some(m => m.displayOrder === displayOrder)) {
      throw new DomainError(`Module display order ${displayOrder} must be unique within subject ${subjectId}.`);
    }

    const module = new Module(moduleId, subjectId, name, displayOrder);
    if (description !== undefined) {
      module.description = description;
    }
    this._modules.push(module);
    subject.modules.push(module);

    this.addDomainEvent(new ModuleAdded(this.id, this.lockVersion, { versionId: version.id, subjectId, moduleId, name }));
    return module;
  }

  public addCompetency(moduleId: string, competencyId: string, code: string, name: string, description?: string, displayOrder: number = 1): Competency {
    const mod = this.getModuleOrThrow(moduleId);
    const subject = this.getSubjectOrThrow(mod.subjectId);
    const course = this.getCourseOrThrow(subject.courseId);
    const version = this.getVersionOrThrow(course.programmeVersionId);
    this.ensureMutable(version);

    const sisterCompetencies = this._competencies.filter(c => c.moduleId === moduleId);
    if (sisterCompetencies.some(c => c.displayOrder === displayOrder)) {
      throw new DomainError(`Competency display order ${displayOrder} must be unique within module ${moduleId}.`);
    }

    const competency = new Competency(competencyId, moduleId, code, name, displayOrder);
    if (description !== undefined) {
      competency.description = description;
    }
    this._competencies.push(competency);
    mod.competencies.push(competency);

    this.addDomainEvent(new CompetencyAdded(this.id, this.lockVersion, { versionId: version.id, moduleId, competencyId, name, code }));
    return competency;
  }

  public addObjective(competencyId: string, objectiveId: string, code: string, description: string, displayOrder: number = 1): LearningObjective {
    const comp = this.getCompetencyOrThrow(competencyId);
    const mod = this.getModuleOrThrow(comp.moduleId);
    const subject = this.getSubjectOrThrow(mod.subjectId);
    const course = this.getCourseOrThrow(subject.courseId);
    const version = this.getVersionOrThrow(course.programmeVersionId);
    this.ensureMutable(version);

    const sisterObjectives = this._objectives.filter(o => o.competencyId === competencyId);
    if (sisterObjectives.some(o => o.displayOrder === displayOrder)) {
      throw new DomainError(`Learning objective display order ${displayOrder} must be unique within competency ${competencyId}.`);
    }

    const obj = new LearningObjective(objectiveId, competencyId, code, description, displayOrder);
    this._objectives.push(obj);
    comp.objectives.push(obj);

    this.addDomainEvent(new LearningObjectiveAdded(this.id, this.lockVersion, { versionId: version.id, competencyId, objectiveId, code }));
    return obj;
  }

  public addOutcome(objectiveId: string, outcomeId: string, code: string, description: string, displayOrder: number = 1): LearningOutcome {
    const obj = this.getObjectiveOrThrow(objectiveId);
    const comp = this.getCompetencyOrThrow(obj.competencyId);
    const mod = this.getModuleOrThrow(comp.moduleId);
    const subject = this.getSubjectOrThrow(mod.subjectId);
    const course = this.getCourseOrThrow(subject.courseId);
    const version = this.getVersionOrThrow(course.programmeVersionId);
    this.ensureMutable(version);

    const sisterOutcomes = this._outcomes.filter(o => o.learningObjectiveId === objectiveId);
    if (sisterOutcomes.some(o => o.displayOrder === displayOrder)) {
      throw new DomainError(`Learning outcome display order ${displayOrder} must be unique within objective ${objectiveId}.`);
    }

    const out = new LearningOutcome(outcomeId, objectiveId, code, description, displayOrder);
    this._outcomes.push(out);
    obj.outcomes.push(out);

    this.addDomainEvent(new LearningOutcomeAdded(this.id, this.lockVersion, { versionId: version.id, objectiveId, outcomeId, code }));
    return out;
  }

  // Helper validation methods
  private getVersionOrThrow(versionId: string): ProgrammeVersion {
    const version = this._versions.find(v => v.id === versionId);
    if (!version) {
      throw new DomainError(`Programme version with ID ${versionId} not found.`);
    }
    return version;
  }

  private getCourseOrThrow(courseId: string): Course {
    const course = this._courses.find(c => c.id === courseId);
    if (!course) {
      throw new DomainError(`Course with ID ${courseId} not found.`);
    }
    return course;
  }

  private getSubjectOrThrow(subjectId: string): Subject {
    const subject = this._subjects.find(s => s.id === subjectId);
    if (!subject) {
      throw new DomainError(`Subject with ID ${subjectId} not found.`);
    }
    return subject;
  }

  private getModuleOrThrow(moduleId: string): Module {
    const mod = this._modules.find(m => m.id === moduleId);
    if (!mod) {
      throw new DomainError(`Module with ID ${moduleId} not found.`);
    }
    return mod;
  }

  private getCompetencyOrThrow(competencyId: string): Competency {
    const comp = this._competencies.find(c => c.id === competencyId);
    if (!comp) {
      throw new DomainError(`Competency with ID ${competencyId} not found.`);
    }
    return comp;
  }

  private getObjectiveOrThrow(objectiveId: string): LearningObjective {
    const obj = this._objectives.find(o => o.id === objectiveId);
    if (!obj) {
      throw new DomainError(`Learning objective with ID ${objectiveId} not found.`);
    }
    return obj;
  }

  private ensureMutable(version: ProgrammeVersion): void {
    if (version.status === 'PUBLISHED' || version.status === 'DEPRECATED') {
      throw new DomainError(`Cannot modify a version in ${version.status} status.`);
    }
  }
}
