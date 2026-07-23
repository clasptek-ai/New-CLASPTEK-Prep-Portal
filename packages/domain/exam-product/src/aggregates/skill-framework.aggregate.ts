import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';
import { SkillCode } from '../value-objects/SkillCode';
import { SkillRevisionCreated } from '../events/SkillRevisionCreated';

export class SkillFrameworkVersion {
  constructor(
    public readonly id: string,
    public readonly skillFrameworkId: string,
    public readonly versionNo: string,
    public status: string,
    public name: string,
    public description?: string,
    public publishedAt?: Date,
    public publishedBy?: string
  ) {}
}

export class Skill {
  constructor(
    public readonly id: string,
    public readonly skillFrameworkId: string,
    public readonly code: SkillCode,
    public canonicalName: string,
    public status: string = 'ACTIVE',
    public currentRevisionId?: string
  ) {}
}

export class SkillRevision {
  constructor(
    public readonly id: string,
    public readonly skillId: string,
    public readonly skillFrameworkVersionId: string,
    public readonly revisionNo: number,
    public name: string,
    public parentSkillRevisionId?: string,
    public description?: string,
    public category?: string,
    public domain?: string,
    public isLeafSkill: boolean = true,
    public status: string = 'ACTIVE'
  ) {}
}

export class SkillFrameworkLevel {
  constructor(
    public readonly id: string,
    public readonly skillFrameworkVersionId: string,
    public readonly code: string,
    public name: string,
    public description: string | undefined,
    public ordinalPosition: number,
    public minimumMasteryPercentage?: number,
    public maximumMasteryPercentage?: number,
    public equivalentFramework?: string,
    public equivalentLevel?: string,
    public status: string = 'ACTIVE'
  ) {}
}

export class SkillRelation {
  constructor(
    public readonly id: string,
    public readonly skillFrameworkVersionId: string,
    public readonly sourceSkillRevisionId: string,
    public readonly targetSkillRevisionId: string,
    public readonly relationType: string,
    public strength?: number,
    public isMandatory: boolean = false,
    public status: string = 'ACTIVE'
  ) {}
}

export class SkillFramework extends AggregateRoot<string> {
  private _versions: SkillFrameworkVersion[] = [];
  private _skills: Skill[] = [];
  private _revisions: SkillRevision[] = [];
  private _levels: SkillFrameworkLevel[] = [];
  private _relations: SkillRelation[] = [];

  public currentVersionId?: string;
  public currentVersionNo?: string;

  constructor(
    id: string,
    public readonly code: string,
    public name: string,
    public description?: string,
    public status: string = 'DRAFT',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get versions(): readonly SkillFrameworkVersion[] {
    return this._versions;
  }

  public get skills(): readonly Skill[] {
    return this._skills;
  }

  public get revisions(): readonly SkillRevision[] {
    return this._revisions;
  }

  public get levels(): readonly SkillFrameworkLevel[] {
    return this._levels;
  }

  public get relations(): readonly SkillRelation[] {
    return this._relations;
  }

  public createVersion(versionId: string, versionNo: string, name: string): SkillFrameworkVersion {
    if (this._versions.some((v) => v.versionNo === versionNo)) {
      throw new DomainError(`Version ${versionNo} already exists in framework.`);
    }
    const ver = new SkillFrameworkVersion(versionId, this.id, versionNo, 'DRAFT', name);
    this._versions.push(ver);
    return ver;
  }

  public addSkill(skillId: string, code: SkillCode, name: string): Skill {
    if (this._skills.some((s) => s.code.value === code.value)) {
      throw new DomainError(`Skill ${code.value} already exists in framework.`);
    }
    const skill = new Skill(skillId, this.id, code, name);
    this._skills.push(skill);
    return skill;
  }

  public addRevision(
    id: string,
    skillId: string,
    versionId: string,
    revisionNo: number,
    name: string,
    parentRevisionId?: string
  ): SkillRevision {
    const skill = this._skills.find((s) => s.id === skillId);
    if (!skill) {
      throw new DomainError(`Skill ${skillId} not found.`);
    }
    const rev = new SkillRevision(id, skillId, versionId, revisionNo, name, parentRevisionId);
    this._revisions.push(rev);

    skill.currentRevisionId = id;

    this.addDomainEvent({
      skillId,
      revisionId: id,
      skillFrameworkVersionId: versionId,
      revisionNo,
      name,
      occurredAt: new Date(),
    } as SkillRevisionCreated);

    return rev;
  }

  public addLevel(
    id: string,
    versionId: string,
    code: string,
    name: string,
    ordinal: number,
    description?: string
  ): SkillFrameworkLevel {
    const lvl = new SkillFrameworkLevel(id, versionId, code, name, description, ordinal);
    this._levels.push(lvl);
    return lvl;
  }

  public addRelation(
    id: string,
    versionId: string,
    sourceId: string,
    targetId: string,
    type: string
  ): SkillRelation {
    const rel = new SkillRelation(id, versionId, sourceId, targetId, type);
    this._relations.push(rel);
    return rel;
  }

  public loadVersions(versions: SkillFrameworkVersion[]): void {
    this._versions = versions;
  }

  public loadSkills(skills: Skill[]): void {
    this._skills = skills;
  }

  public loadRevisions(revisions: SkillRevision[]): void {
    this._revisions = revisions;
  }

  public loadLevels(levels: SkillFrameworkLevel[]): void {
    this._levels = levels;
  }

  public loadRelations(relations: SkillRelation[]): void {
    this._relations = relations;
  }
}
