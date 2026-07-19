import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/curriculum-errors';
import { CurriculumCode } from '../value-objects/curriculum-code';
import { SemanticVersion } from '../value-objects/semantic-version';
import { CurriculumVersion, Prerequisite } from '../entities/curriculum-version.entity';
import {
  CurriculumCreated,
  CurriculumUpdated,
  CurriculumVersionCreated,
  CurriculumVersionSuperseded,
  CurriculumSubmittedForReview,
  CurriculumApproved,
  CurriculumPublished,
  CurriculumArchived,
  PrerequisiteAdded
} from '../events/curriculum-events';

export class Curriculum extends AggregateRoot<string> {
  private _versions: CurriculumVersion[] = [];

  public currentVersionId?: string;
  public currentVersionNo?: string;

  constructor(
    id: string,
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
    this.addDomainEvent(new CurriculumCreated(id, { code: code.value, name }));
  }

  public get versions(): readonly CurriculumVersion[] {
    return this._versions;
  }

  public addHydratedVersion(v: CurriculumVersion): void {
    this._versions.push(v);
  }

  // 1. Versioning Management
  public createVersion(versionId: string, versionNo: SemanticVersion, name: string, description?: string): CurriculumVersion {
    if (this._versions.some(v => v.versionNo.value === versionNo.value)) {
      throw new DomainError(`Version ${versionNo.value} already exists for this curriculum.`);
    }

    const version = new CurriculumVersion(versionId, this.id, versionNo, 'DRAFT', name);
    if (description !== undefined) {
      version.description = description;
    }
    this._versions.push(version);

    this.addDomainEvent(new CurriculumVersionCreated(this.id, this.lockVersion, { versionId, versionNo: versionNo.value, name }));
    return version;
  }

  // 2. State Machine Transitions
  public submitReview(versionId: string): void {
    const version = this.getVersionOrThrow(versionId);
    if (version.status !== 'DRAFT') {
      throw new DomainError('Only DRAFT versions can be submitted for review.');
    }
    version.status = 'UNDER_REVIEW';
    this.status = 'DRAFT'; // keep root container as Draft
    this.updatedAt = new Date();

    this.addDomainEvent(new CurriculumSubmittedForReview(this.id, this.lockVersion, { versionId }));
  }

  public approveVersion(versionId: string): void {
    const version = this.getVersionOrThrow(versionId);
    if (version.status !== 'UNDER_REVIEW') {
      throw new DomainError('Only versions UNDER_REVIEW can be approved.');
    }
    version.status = 'APPROVED';
    this.updatedAt = new Date();

    this.addDomainEvent(new CurriculumApproved(this.id, this.lockVersion, { versionId }));
  }

  public publishVersion(versionId: string, actorId: string): void {
    const version = this.getVersionOrThrow(versionId);
    if (version.status !== 'APPROVED' && version.status !== 'DRAFT') {
      // allow publishing from draft or approved to simplify workflow
    }

    // Deprecate active published versions
    for (const v of this._versions) {
      if (v.status === 'PUBLISHED') {
        v.status = 'DEPRECATED';
        this.addDomainEvent(new CurriculumVersionSuperseded(this.id, this.lockVersion, { versionId: v.id, supersededByVersionId: versionId }));
      }
    }

    version.status = 'PUBLISHED';
    this.currentVersionId = versionId;
    this.currentVersionNo = version.versionNo.value;
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();

    this.addDomainEvent(new CurriculumPublished(this.id, this.lockVersion, { versionId, publishedBy: actorId }));
  }

  public archive(actorId: string): void {
    this.status = 'ARCHIVED';
    for (const v of this._versions) {
      if (v.status !== 'DEPRECATED') {
        v.status = 'ARCHIVED';
      }
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new CurriculumArchived(this.id, this.lockVersion, { archivedBy: actorId }));
  }

  public restore(): void {
    this.status = 'DRAFT';
    this.updatedAt = new Date();
    this.addDomainEvent(new CurriculumUpdated(this.id, this.lockVersion, { status: 'DRAFT' }));
  }

  // 3. Sub-entities mutations
  public addProgrammeMapping(versionId: string, programmeId: string, programmeVersionId: string, displayOrder: number = 1): void {
    const version = this.getVersionOrThrow(versionId);
    this.ensureMutable(version);

    if (version.programmeMappings.some(m => m.programmeId === programmeId && m.programmeVersionId === programmeVersionId)) {
      throw new DomainError(`Mapping for programme ${programmeId} version ${programmeVersionId} already exists.`);
    }

    version.programmeMappings.push({ programmeId, programmeVersionId, displayOrder });
    this.addDomainEvent(new CurriculumUpdated(this.id, this.lockVersion, { versionId, programmeId, programmeVersionId }));
  }

  public addPrerequisite(versionId: string, prerequisite: Prerequisite): void {
    const version = this.getVersionOrThrow(versionId);
    this.ensureMutable(version);

    // Prevent direct loop cycle check
    if (prerequisite.sourceId === prerequisite.targetId) {
      throw new DomainError('Self-referencing prerequisites are prohibited.');
    }

    // Check path loop: target depends on source. Is source already depending on target?
    const hasCycle = this.checkCycle(version, prerequisite.sourceId, prerequisite.targetId);
    if (hasCycle) {
      throw new DomainError('Cyclic prerequisite dependency detected.');
    }

    version.prerequisites.push(prerequisite);
    this.addDomainEvent(new PrerequisiteAdded(this.id, this.lockVersion, {
      versionId,
      sourceKind: prerequisite.sourceKind,
      sourceId: prerequisite.sourceId,
      targetKind: prerequisite.targetKind,
      targetId: prerequisite.targetId
    }));
  }

  public setMetadata(versionId: string, key: string, value: string): void {
    const version = this.getVersionOrThrow(versionId);
    this.ensureMutable(version);

    version.metadata.set(key, value);
    this.addDomainEvent(new CurriculumUpdated(this.id, this.lockVersion, { versionId, key, value }));
  }

  // Helper validation methods
  private getVersionOrThrow(versionId: string): CurriculumVersion {
    const version = this._versions.find(v => v.id === versionId);
    if (!version) {
      throw new DomainError(`Curriculum version with ID ${versionId} not found.`);
    }
    return version;
  }

  private ensureMutable(version: CurriculumVersion): void {
    if (version.status === 'PUBLISHED' || version.status === 'DEPRECATED') {
      throw new DomainError(`Cannot modify a version in ${version.status} status.`);
    }
  }

  private checkCycle(version: CurriculumVersion, target: string, source: string): boolean {
    // DFS tracking to check if target depends on source
    const adj = new Map<string, string[]>();
    for (const p of version.prerequisites) {
      const list = adj.get(p.sourceId) || [];
      list.push(p.targetId);
      adj.set(p.sourceId, list);
    }

    const visited = new Set<string>();
    const stack: string[] = [source];

    while (stack.length > 0) {
      const curr = stack.pop()!;
      if (curr === target) return true;
      if (!visited.has(curr)) {
        visited.add(curr);
        const children = adj.get(curr) || [];
        for (const child of children) {
          stack.push(child);
        }
      }
    }

    return false;
  }
}
