import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import { VersionStatus } from '../value-objects/learning-resource-value-objects';
import {
  ResourceVersionPublished,
  ResourceVersionRetired,
  ResourceArchived
} from '../events/learning-resource-events';

export class ResourceVersion extends AggregateRoot<string> {
  public metadata: Map<string, string> = new Map();

  constructor(
    id: string,
    public readonly resourceVariantId: string,
    public readonly versionNo: number,
    public status: VersionStatus = new VersionStatus('draft'),
    public title: string,
    public description: string,
    public resourceFormatId: string,
    public versionLabel: string | null = null,
    public changeSummary: string | null = null,
    public sourceAttribution: string | null = null,
    public copyrightOwner: string | null = null,
    public copyrightYear: number | null = null,
    public licenseId: string | null = null,
    public estimatedStudyMinutes: number = 0,
    public requiresPreview: boolean = false,
    public allowsDownload: boolean = true,
    public allowsStreaming: boolean = false,
    public effectiveFrom: Date | null = null,
    public effectiveTo: Date | null = null,
    public reviewedAt: Date | null = null,
    public reviewedBy: string | null = null,
    public publishedAt: Date | null = null,
    public publishedBy: string | null = null,
    public retiredAt: Date | null = null,
    public retiredBy: string | null = null,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
    if (estimatedStudyMinutes < 0) {
      throw new DomainError('Estimated study minutes cannot be negative.', 'INVALID_STUDY_TIME');
    }
  }

  public static create(
    id: string,
    resourceVariantId: string,
    versionNo: number,
    title: string,
    description: string,
    resourceFormatId: string,
    estimatedStudyMinutes: number = 0
  ): ResourceVersion {
    return new ResourceVersion(
      id,
      resourceVariantId,
      versionNo,
      new VersionStatus('draft'),
      title,
      description,
      resourceFormatId,
      null, null, null, null, null, null,
      estimatedStudyMinutes
    );
  }

  public submitForReview(_reviewerId?: string) {
    if (this.status.value !== 'draft' && this.status.value !== 'failed') {
      throw new DomainError(`Cannot submit version for review from status ${this.status.value}.`, 'INVALID_STATUS_TRANSITION');
    }
    this.status = new VersionStatus('review');
    this.updatedAt = new Date();
  }

  public publish(publishedBy: string) {
    if (this.status.value !== 'review' && this.status.value !== 'draft') {
      throw new DomainError(`Cannot publish version from status ${this.status.value}.`, 'INVALID_STATUS_TRANSITION');
    }
    this.status = new VersionStatus('published');
    this.publishedBy = publishedBy;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceVersionPublished(this.resourceVariantId, this.id, this.versionNo));
  }

  public retire(retiredBy: string) {
    if (this.status.value !== 'published') {
      throw new DomainError('Cannot retire a version that is not published.', 'INVALID_STATUS_TRANSITION');
    }
    this.status = new VersionStatus('retired');
    this.retiredBy = retiredBy;
    this.retiredAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceVersionRetired(this.resourceVariantId, this.id, this.versionNo));
  }

  public archive() {
    this.status = new VersionStatus('archived');
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceArchived(this.id));
  }

  public setMetadata(key: string, value: string) {
    if (this.status.value === 'published' || this.status.value === 'retired') {
      throw new DomainError('Cannot modify metadata of a published or retired version.', 'VERSION_LOCKED');
    }
    this.metadata.set(key, value);
    this.updatedAt = new Date();
  }
}
