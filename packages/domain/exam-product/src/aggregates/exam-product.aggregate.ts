import { AggregateRoot } from '@clasptek/kernel';
import { ExamCode } from '../value-objects/ExamCode';
import { VersionNumber } from '../value-objects/VersionNumber';
import { ExamProductStatus, AllowedStatuses } from '../value-objects/ExamProductStatus';
import { DomainError } from '../errors/exam-product-errors';
import { ExamProductCreated } from '../events/ExamProductCreated';
import { ExamProductPublished } from '../events/ExamProductPublished';
import { ExamProductArchived } from '../events/ExamProductArchived';

export class ExamProductVersion {
  constructor(
    public readonly id: string,
    public readonly examProductId: string,
    public readonly versionNo: VersionNumber,
    public status: AllowedStatuses,
    public name: string,
    public description?: string,
    public officialBoardName?: string,
    public officialBoardCode?: string,
    public officialWebsite?: string,
    public durationMinutes?: number,
    public validityPeriodMonths?: number,
    public primaryLanguageCode: string = 'en',
    public examType?: 'ADAPTIVE' | 'LINEAR' | 'HYBRID',
    public publishedAt?: Date,
    public publishedBy?: string
  ) {}
}

export class ExamProduct extends AggregateRoot<string> {
  private _versions: ExamProductVersion[] = [];
  public currentVersionId?: string;
  public currentVersionNo?: string;

  constructor(
    id: string,
    public readonly code: ExamCode,
    public readonly slug: string,
    public name: string,
    public description: string,
    public readonly productFamily: string,
    public status: ExamProductStatus = new ExamProductStatus('DRAFT'),
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
    this.addDomainEvent({
      productId: id,
      code: code.value,
      name,
      productFamily,
      occurredAt: createdAt,
    } as ExamProductCreated);
  }

  public get versions(): readonly ExamProductVersion[] {
    return this._versions;
  }

  public createVersion(
    versionId: string,
    versionNo: VersionNumber,
    name: string,
    description?: string
  ): ExamProductVersion {
    if (this._versions.some((v) => v.versionNo.value === versionNo.value)) {
      throw new DomainError(`Version ${versionNo.value} already exists.`);
    }

    const version = new ExamProductVersion(versionId, this.id, versionNo, 'DRAFT', name, description);
    this._versions.push(version);
    return version;
  }

  public approveVersion(versionId: string): void {
    const version = this._versions.find((v) => v.id === versionId);
    if (!version) {
      throw new DomainError(`Version ${versionId} not found.`);
    }
    version.status = 'APPROVED';
    this.status = new ExamProductStatus('APPROVED');
    this.updatedAt = new Date();
  }

  public publishVersion(versionId: string, actorId: string): void {
    const version = this._versions.find((v) => v.id === versionId);
    if (!version) {
      throw new DomainError(`Version ${versionId} not found.`);
    }

    for (const v of this._versions) {
      if (v.status === 'PUBLISHED') {
        v.status = 'DEPRECATED';
      }
    }

    version.status = 'PUBLISHED';
    version.publishedAt = new Date();
    version.publishedBy = actorId;

    this.currentVersionId = version.id;
    this.currentVersionNo = version.versionNo.value;
    this.status = new ExamProductStatus('PUBLISHED');
    this.updatedAt = new Date();

    this.addDomainEvent({
      productId: this.id,
      versionId,
      versionNo: version.versionNo.value,
      publishedBy: actorId,
      occurredAt: this.updatedAt,
    } as ExamProductPublished);
  }

  public archive(actorId: string): void {
    this.status = new ExamProductStatus('ARCHIVED');
    for (const v of this._versions) {
      v.status = 'ARCHIVED';
    }
    this.updatedAt = new Date();

    this.addDomainEvent({
      productId: this.id,
      archivedBy: actorId,
      occurredAt: this.updatedAt,
    } as ExamProductArchived);
  }

  public loadVersions(versions: ExamProductVersion[]): void {
    this._versions = versions;
  }
}
