import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseLearningResourceEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class LearningResourceCreated extends BaseLearningResourceEvent {
  constructor(resourceId: string, code: string, slug: string) {
    super('LearningResourceCreated', resourceId, { code, slug });
  }
}

export class ResourceVariantCreated extends BaseLearningResourceEvent {
  constructor(resourceId: string, variantId: string, code: string) {
    super('ResourceVariantCreated', resourceId, { variantId, code });
  }
}

export class ResourceVersionCreated extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, versionNo: number) {
    super('ResourceVersionCreated', resourceId, { versionId, versionNo });
  }
}

export class ResourceVersionPublished extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, versionNo: number) {
    super('ResourceVersionPublished', resourceId, { versionId, versionNo });
  }
}

export class ResourceVersionRetired extends BaseLearningResourceEvent {
  constructor(resourceId: string, versionId: string, versionNo: number) {
    super('ResourceVersionRetired', resourceId, { versionId, versionNo });
  }
}

export class ResourceArchived extends BaseLearningResourceEvent {
  constructor(resourceId: string) {
    super('ResourceArchived', resourceId);
  }
}

export class ResourceCollectionCreated extends BaseLearningResourceEvent {
  constructor(collectionId: string, code: string) {
    super('ResourceCollectionCreated', collectionId, { code });
  }
}

export class ResourceCollectionUpdated extends BaseLearningResourceEvent {
  constructor(collectionId: string, name: string) {
    super('ResourceCollectionUpdated', collectionId, { name });
  }
}

export class CollectionResourceAdded extends BaseLearningResourceEvent {
  constructor(collectionId: string, resourceId: string) {
    super('CollectionResourceAdded', collectionId, { resourceId });
  }
}

export class CollectionResourceRemoved extends BaseLearningResourceEvent {
  constructor(collectionId: string, resourceId: string) {
    super('CollectionResourceRemoved', collectionId, { resourceId });
  }
}

export class StorageAssetReserved extends BaseLearningResourceEvent {
  constructor(assetId: string, path: string, sizeBytes: number) {
    super('StorageAssetReserved', assetId, { path, sizeBytes });
  }
}

export class StorageAssetUploaded extends BaseLearningResourceEvent {
  constructor(assetId: string, path: string) {
    super('StorageAssetUploaded', assetId, { path });
  }
}

export class StorageAssetValidated extends BaseLearningResourceEvent {
  constructor(assetId: string, mimeType: string, checksum: string) {
    super('StorageAssetValidated', assetId, { mimeType, checksum });
  }
}

export class StorageAssetQuarantined extends BaseLearningResourceEvent {
  constructor(assetId: string, reason: string) {
    super('StorageAssetQuarantined', assetId, { reason });
  }
}

export class StorageAssetPromoted extends BaseLearningResourceEvent {
  constructor(assetId: string, destinationPath: string) {
    super('StorageAssetPromoted', assetId, { destinationPath });
  }
}

export class StorageAssetDeleted extends BaseLearningResourceEvent {
  constructor(assetId: string) {
    super('StorageAssetDeleted', assetId);
  }
}
