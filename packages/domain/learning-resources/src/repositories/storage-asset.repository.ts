import { StorageAsset } from '../aggregates/storage-asset.aggregate';

export interface StorageAssetRepository {
  save(asset: StorageAsset): Promise<void>;
  findById(id: string): Promise<StorageAsset | null>;
  findByPath(bucketName: string, objectPath: string): Promise<StorageAsset | null>;
  findByChecksum(checksum: string): Promise<StorageAsset | null>;
  nextIdentity(): string;
}
