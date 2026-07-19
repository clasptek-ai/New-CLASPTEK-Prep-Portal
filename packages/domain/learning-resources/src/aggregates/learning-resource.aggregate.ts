import { AggregateRoot, Entity } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import { ResourceCode, SemanticVersion } from '../value-objects/learning-resource-value-objects';
import {
  ResourceVersionCreated,
  ResourceVersionPublished,
  ResourceArchived
} from '../events/learning-resource-events';

export class MediaAsset extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public provider: string,
    public bucket: string,
    public objectKey: string,
    public region: string,
    public checksum: string,
    public mimeType: string,
    public size: number,
    public duration: number | null,
    public hashAlgorithm: string = 'SHA-256',
    public encryptionStatus: string = 'NONE'
  ) {
    super(id);
  }
}

export class Attachment extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public name: string,
    public fileSize: number,
    public mimeType: string,
    public objectKey: string
  ) {
    super(id);
  }
}

export class Download extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public url: string,
    public title: string
  ) {
    super(id);
  }
}

export class ExternalLink extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public url: string,
    public title: string
  ) {
    super(id);
  }
}

export class Transcript extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public transcriptText: string,
    public language: string
  ) {
    super(id);
  }
}

export class Caption extends Entity<string> {
  constructor(
    id: string,
    public readonly resourceVersionId: string,
    public captionText: string,
    public language: string
  ) {
    super(id);
  }
}

export class ResourceVersion extends Entity<string> {
  public mediaAsset: MediaAsset | null = null;
  public attachments: Attachment[] = [];
  public downloads: Download[] = [];
  public externalLinks: ExternalLink[] = [];
  public transcripts: Transcript[] = [];
  public captions: Caption[] = [];
  public metadata: Map<string, string> = new Map();

  constructor(
    id: string,
    public readonly learningResourceId: string,
    public readonly versionNo: SemanticVersion,
    public status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED',
    public name: string,
    public description: string
  ) {
    super(id);
  }

  public setMediaAsset(media: MediaAsset) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.mediaAsset = media;
  }

  public addAttachment(att: Attachment) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.attachments.push(att);
  }

  public addDownload(dl: Download) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.downloads.push(dl);
  }

  public addExternalLink(link: ExternalLink) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.externalLinks.push(link);
  }

  public addTranscript(transcript: Transcript) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.transcripts.push(transcript);
  }

  public addCaption(caption: Caption) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.captions.push(caption);
  }

  public setMetadata(key: string, value: string) {
    if (this.status === 'PUBLISHED') {
      throw new DomainError('Cannot modify published resource version.', 'VERSION_LOCKED');
    }
    this.metadata.set(key, value);
  }
}

export class LearningResource extends AggregateRoot<string> {
  public versions: ResourceVersion[] = [];
  public currentVersionId: string | null = null;

  constructor(
    id: string,
    public readonly lessonId: string,
    public readonly code: ResourceCode,
    public readonly resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'ARTICLE' | 'MARKDOWN' | 'PRESENTATION' | 'DOWNLOAD' | 'IMAGE' | 'EXERCISE' | 'ASSIGNMENT' | 'EXTERNAL_LINK',
    public slug: string,
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
    if (!['VIDEO', 'AUDIO', 'PDF', 'ARTICLE', 'MARKDOWN', 'PRESENTATION', 'DOWNLOAD', 'IMAGE', 'EXERCISE', 'ASSIGNMENT', 'EXTERNAL_LINK'].includes(resourceType)) {
      throw new DomainError(`Invalid resource type: ${resourceType}`, 'INVALID_RESOURCE_TYPE');
    }
  }

  public static create(
    id: string,
    lessonId: string,
    code: ResourceCode,
    resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'ARTICLE' | 'MARKDOWN' | 'PRESENTATION' | 'DOWNLOAD' | 'IMAGE' | 'EXERCISE' | 'ASSIGNMENT' | 'EXTERNAL_LINK',
    slug: string,
    name: string,
    description: string,
    displayOrder: number
  ): LearningResource {
    return new LearningResource(id, lessonId, code, resourceType, slug, name, description, displayOrder, 'DRAFT', 0);
  }

  public update(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }

  public createVersion(
    versionId: string,
    versionNo: SemanticVersion,
    name: string,
    description: string
  ): ResourceVersion {
    if (this.status === 'ARCHIVED') {
      throw new DomainError('Cannot create versions for archived resource.', 'RESOURCE_ARCHIVED');
    }
    if (this.versions.some(v => v.versionNo.value === versionNo.value)) {
      throw new DomainError(`Version ${versionNo.value} already exists.`, 'DUPLICATE_VERSION');
    }
    const version = new ResourceVersion(versionId, this.id, versionNo, 'DRAFT', name, description);
    this.versions.push(version);
    this.addDomainEvent(new ResourceVersionCreated(this.id, versionId, versionNo.value));
    return version;
  }

  public setMediaAsset(
    versionNo: SemanticVersion,
    mediaId: string,
    provider: string,
    bucket: string,
    objectKey: string,
    region: string,
    checksum: string,
    mimeType: string,
    size: number,
    duration: number | null,
    hashAlgorithm?: string,
    encryptionStatus?: string
  ) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    const media = new MediaAsset(mediaId, version.id, provider, bucket, objectKey, region, checksum, mimeType, size, duration, hashAlgorithm, encryptionStatus);
    version.setMediaAsset(media);
  }

  public addAttachment(
    versionNo: SemanticVersion,
    attachmentId: string,
    name: string,
    fileSize: number,
    mimeType: string,
    objectKey: string
  ) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    const att = new Attachment(attachmentId, version.id, name, fileSize, mimeType, objectKey);
    version.addAttachment(att);
  }

  public addDownload(versionNo: SemanticVersion, id: string, url: string, title: string) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    version.addDownload(new Download(id, version.id, url, title));
  }

  public addExternalLink(versionNo: SemanticVersion, id: string, url: string, title: string) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    version.addExternalLink(new ExternalLink(id, version.id, url, title));
  }

  public addTranscript(versionNo: SemanticVersion, id: string, text: string, lang: string) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    version.addTranscript(new Transcript(id, version.id, text, lang));
  }

  public addCaption(versionNo: SemanticVersion, id: string, text: string, lang: string) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    version.addCaption(new Caption(id, version.id, text, lang));
  }

  public setMetadata(versionNo: SemanticVersion, key: string, value: string) {
    const version = this.versions.find(v => v.versionNo.value === versionNo.value);
    if (!version) throw new DomainError(`Version ${versionNo.value} not found.`, 'VERSION_NOT_FOUND');
    version.setMetadata(key, value);
  }

  public publishVersion(versionNo: SemanticVersion) {
    if (this.status === 'ARCHIVED') {
      throw new DomainError('Cannot publish an archived resource.', 'RESOURCE_ARCHIVED');
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

    this.addDomainEvent(new ResourceVersionPublished(this.id, version.id, versionNo.value));
  }

  public archive() {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceArchived(this.id));
  }

  public restore() {
    this.status = 'DRAFT';
    this.updatedAt = new Date();
  }
}
