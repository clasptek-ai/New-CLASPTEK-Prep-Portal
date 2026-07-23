import {
  LearningResource,
  ResourceVersion,
  ResourceCollection,
  StorageAsset,
  ResourceCode,
  SensitivityLevel,
  VisibilityScope,
  VariantPurpose,
  LearningResourceRepository,
  ResourceVersionRepository,
  ResourceCollectionRepository,
  StorageAssetRepository,
} from '@clasptek/domain-learning-resources';
import { ConflictError, NotFoundError } from '@clasptek/kernel';
import {
  ObjectStoragePort,
  MimeInspectionPort,
  ChecksumPort,
  SecurityScanPort,
  StorageQuotaPort,
} from '../ports/storage-ports';

// 1. DTO interfaces
export interface CreateResourceDTO {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  resourceTypeId: string;
  primaryCategoryId?: string | null;
  sensitivity?: 'normal' | 'internal' | 'instructor_only' | 'restricted' | 'confidential';
  visibility?: 'private' | 'organization' | 'authenticated' | 'controlled_public';
}

export interface CreateVersionDTO {
  id: string;
  resourceVariantId: string;
  versionNo: number;
  title: string;
  description: string;
  resourceFormatId: string;
  estimatedStudyMinutes?: number;
}

export interface RequestUploadSessionDTO {
  uploadSessionId: string;
  organizationId: string;
  resourceVersionId: string;
  requestedFormatId: string;
  originalFilename: string;
  declaredMimeType: string;
  declaredSizeBytes: number;
}

export interface CompleteUploadDTO {
  uploadSessionId: string;
  tempFilePath: string;
}

export interface PublishVersionDTO {
  resourceVersionId: string;
  publishedBy: string;
}

export interface ArchiveResourceDTO {
  resourceId: string;
}

export interface CreateCollectionDTO {
  id: string;
  parentCollectionId?: string | null;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface AddToCollectionDTO {
  collectionId: string;
  resourceId: string;
}

// 2. Command Handlers
export class CreateResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(dto: CreateResourceDTO): Promise<void> {
    const codeVo = new ResourceCode(dto.code);
    const exists = await this.resourceRepo.exists(codeVo.value);
    if (exists) {
      throw new ConflictError(`Resource code ${dto.code} already exists.`);
    }

    const resource = LearningResource.create(
      dto.id,
      codeVo,
      dto.slug,
      dto.title,
      dto.description,
      dto.resourceTypeId,
      dto.primaryCategoryId || null,
      dto.sensitivity ? new SensitivityLevel(dto.sensitivity) : undefined,
      dto.visibility ? new VisibilityScope(dto.visibility) : undefined
    );

    // Create the default variant automatically
    resource.addVariant(
      this.resourceRepo.nextIdentity(),
      'default',
      'en',
      new VariantPurpose('standard'),
      true
    );

    await this.resourceRepo.save(resource);
  }
}

export class CreateResourceVersionHandler {
  constructor(private readonly versionRepo: ResourceVersionRepository) {}

  public async execute(dto: CreateVersionDTO): Promise<void> {
    const version = ResourceVersion.create(
      dto.id,
      dto.resourceVariantId,
      dto.versionNo,
      dto.title,
      dto.description,
      dto.resourceFormatId,
      dto.estimatedStudyMinutes || 0
    );

    await this.versionRepo.save(version);
  }
}

export class RequestUploadSessionHandler {
  constructor(
    private readonly assetRepo: StorageAssetRepository,
    private readonly quotaPort: StorageQuotaPort,
    private readonly storagePort: ObjectStoragePort
  ) {}

  public async execute(dto: RequestUploadSessionDTO): Promise<string> {
    // 1. Quota check
    const hasQuota = await this.quotaPort.hasSufficientQuota(
      dto.organizationId,
      dto.declaredSizeBytes
    );
    if (!hasQuota) {
      throw new ConflictError('Storage quota limit reached for organization.');
    }

    // 2. Setup storage path
    const bucketName = 'resource-ingest';
    const objectPath = `org/${dto.organizationId}/session/${dto.uploadSessionId}/${dto.originalFilename}`;

    const asset = StorageAsset.reserve(
      dto.uploadSessionId,
      bucketName,
      objectPath,
      dto.originalFilename,
      dto.declaredMimeType,
      dto.declaredSizeBytes
    );

    await this.quotaPort.reserveQuota(
      dto.organizationId,
      dto.uploadSessionId,
      dto.declaredSizeBytes
    );
    await this.assetRepo.save(asset);

    // 3. Generate short-lived signed upload URL
    const signedUrl = await this.storagePort.generateSignedUploadUrl(bucketName, objectPath, 900); // 15 mins
    return signedUrl;
  }
}

export class CompleteUploadHandler {
  constructor(
    private readonly assetRepo: StorageAssetRepository,
    private readonly storagePort: ObjectStoragePort,
    private readonly mimeInspection: MimeInspectionPort,
    private readonly checksumPort: ChecksumPort,
    private readonly securityScan: SecurityScanPort,
    private readonly quotaPort: StorageQuotaPort
  ) {}

  public async execute(dto: CompleteUploadDTO): Promise<void> {
    const asset = await this.assetRepo.findById(dto.uploadSessionId);
    if (!asset) {
      throw new NotFoundError('Upload session not found.');
    }

    // 1. Mark uploaded
    asset.markUploaded();

    // 2. Perform server-side inspections
    const mime = await this.mimeInspection.detectMimeType(dto.tempFilePath);
    const hash = await this.checksumPort.calculateSHA256(dto.tempFilePath);

    // Check size matches (tempFilePath represents local physical upload check in test/runtime)
    asset.validateIntegrity(mime, asset.sizeBytes, hash);

    // 3. Scan security
    const scan = await this.securityScan.scanFile(asset.bucketName, asset.objectPath);
    if (!scan.isClear) {
      asset.quarantine(scan.threats.join(', '));
      await this.assetRepo.save(asset);
      throw new ConflictError(
        `Security threat detected: ${scan.threats.join(', ')}. Ingest quarantined.`
      );
    }

    asset.clearSecurity();

    // 4. Promote asset from ingest to private bucket
    const targetBucket = 'resource-private';
    const targetPath = asset.objectPath.replace('session/', 'resource/');

    await this.storagePort.promote(asset.bucketName, asset.objectPath, targetBucket, targetPath);
    asset.promote(targetPath);
    asset.bucketName = targetBucket;

    await this.quotaPort.commitQuotaUsage(asset.id, asset.sizeBytes);
    await this.assetRepo.save(asset);
  }
}

export class PublishResourceVersionHandler {
  constructor(private readonly versionRepo: ResourceVersionRepository) {}

  public async execute(dto: PublishVersionDTO): Promise<void> {
    const version = await this.versionRepo.findById(dto.resourceVersionId);
    if (!version) {
      throw new NotFoundError('Version not found.');
    }

    version.publish(dto.publishedBy);
    await this.versionRepo.save(version);
  }
}

export class ArchiveResourceHandler {
  constructor(private readonly resourceRepo: LearningResourceRepository) {}

  public async execute(dto: ArchiveResourceDTO): Promise<void> {
    const resource = await this.resourceRepo.findById(dto.resourceId);
    if (!resource) {
      throw new NotFoundError('Resource not found.');
    }
    resource.archive();
    await this.resourceRepo.save(resource);
  }
}

export class CreateCollectionHandler {
  constructor(private readonly collectionRepo: ResourceCollectionRepository) {}

  public async execute(dto: CreateCollectionDTO): Promise<void> {
    const exists = await this.collectionRepo.findByCode(dto.code);
    if (exists) {
      throw new ConflictError(`Collection code ${dto.code} already exists.`);
    }

    const col = ResourceCollection.create(
      dto.id,
      dto.parentCollectionId || null,
      dto.code,
      dto.name,
      dto.description || undefined,
      dto.displayOrder || 1
    );

    await this.collectionRepo.save(col);
  }
}

export class AddResourceToCollectionHandler {
  constructor(private readonly collectionRepo: ResourceCollectionRepository) {}

  public async execute(dto: AddToCollectionDTO): Promise<void> {
    const col = await this.collectionRepo.findById(dto.collectionId);
    if (!col) {
      throw new NotFoundError('Collection not found.');
    }
    col.addResource(dto.resourceId);
    await this.collectionRepo.save(col);
  }
}
