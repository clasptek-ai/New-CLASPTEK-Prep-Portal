import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import {
  StorageAssetReserved,
  StorageAssetUploaded,
  StorageAssetValidated,
  StorageAssetQuarantined,
  StorageAssetPromoted,
  StorageAssetDeleted,
} from '../events/learning-resource-events';

export class StorageAsset extends AggregateRoot<string> {
  constructor(
    id: string,
    public storageProvider: string = 'supabase_storage',
    public bucketName: string,
    public objectPath: string,
    public providerObjectId: string | null = null,
    public originalFilename: string,
    public detectedMimeType: string,
    public detectedExtension: string,
    public sizeBytes: number,
    public etag: string | null = null,
    public storageClass: string = 'STANDARD',
    public integrityStatus: 'unchecked' | 'validated' | 'failed' = 'unchecked',
    public securityStatus:
      'unchecked' | 'scanning' | 'validated_clear' | 'quarantined' | 'failed' = 'unchecked',
    public availabilityStatus:
      'unavailable' | 'available' | 'archived' | 'deletion_pending' | 'deleted' = 'unavailable',
    public uploadedAt: Date = new Date(),
    public validatedAt: Date | null = null,
    public promotedAt: Date | null = null,
    public retentionUntil: Date | null = null,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
    if (sizeBytes < 0) {
      throw new DomainError('File size cannot be negative.', 'INVALID_FILE_SIZE');
    }
  }

  public static reserve(
    id: string,
    bucketName: string,
    objectPath: string,
    originalFilename: string,
    declaredMimeType: string,
    declaredSizeBytes: number
  ): StorageAsset {
    const asset = new StorageAsset(
      id,
      'supabase_storage',
      bucketName,
      objectPath,
      null,
      originalFilename,
      declaredMimeType,
      originalFilename.split('.').pop() || '',
      declaredSizeBytes,
      null,
      'STANDARD',
      'unchecked',
      'unchecked',
      'unavailable'
    );
    asset.addDomainEvent(new StorageAssetReserved(id, objectPath, declaredSizeBytes));
    return asset;
  }

  public markUploaded() {
    this.uploadedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new StorageAssetUploaded(this.id, this.objectPath));
  }

  public validateIntegrity(detectedMime: string, detectedSize: number, sha256Value: string) {
    if (detectedSize !== this.sizeBytes) {
      this.integrityStatus = 'failed';
      throw new DomainError(
        `File size mismatch: declared ${this.sizeBytes} bytes, found ${detectedSize} bytes.`,
        'INTEGRITY_SIZE_MISMATCH'
      );
    }
    this.detectedMimeType = detectedMime;
    this.integrityStatus = 'validated';
    this.validatedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new StorageAssetValidated(this.id, detectedMime, sha256Value));
  }

  public quarantine(reason: string) {
    this.securityStatus = 'quarantined';
    this.availabilityStatus = 'unavailable';
    this.updatedAt = new Date();
    this.addDomainEvent(new StorageAssetQuarantined(this.id, reason));
  }

  public clearSecurity() {
    this.securityStatus = 'validated_clear';
    this.updatedAt = new Date();
  }

  public promote(destinationPath: string) {
    if (this.securityStatus === 'quarantined') {
      throw new DomainError(
        'Cannot promote quarantined storage object.',
        'PROMOTION_FAILED_QUARANTINE'
      );
    }
    if (this.integrityStatus !== 'validated') {
      throw new DomainError(
        'Cannot promote unchecked or failed storage object.',
        'PROMOTION_FAILED_INTEGRITY'
      );
    }
    this.objectPath = destinationPath;
    this.availabilityStatus = 'available';
    this.promotedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new StorageAssetPromoted(this.id, destinationPath));
  }

  public markDeleted() {
    this.availabilityStatus = 'deleted';
    this.updatedAt = new Date();
    this.addDomainEvent(new StorageAssetDeleted(this.id));
  }
}
