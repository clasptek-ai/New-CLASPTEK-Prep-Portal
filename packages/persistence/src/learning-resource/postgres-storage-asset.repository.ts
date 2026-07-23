import { Pool } from 'pg';
import { StorageAsset, StorageAssetRepository } from '@clasptek/domain-learning-resources';
import { randomUUID } from 'crypto';

export class PostgresStorageAssetRepository implements StorageAssetRepository {
  private readonly pool: Pool;
  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public async save(asset: StorageAsset): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert or update storage_objects row
      const assetQuery = `
        INSERT INTO public.storage_objects (
          id, storage_provider, bucket_name, object_path, provider_object_id,
          original_filename, detected_mime_type, detected_extension, size_bytes,
          etag, storage_class, integrity_status, security_status, availability_status,
          uploaded_at, validated_at, promoted_at, retention_until, lock_version, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, now())
        ON CONFLICT (id) DO UPDATE SET
          bucket_name = EXCLUDED.bucket_name,
          object_path = EXCLUDED.object_path,
          integrity_status = EXCLUDED.integrity_status,
          security_status = EXCLUDED.security_status,
          availability_status = EXCLUDED.availability_status,
          uploaded_at = EXCLUDED.uploaded_at,
          validated_at = EXCLUDED.validated_at,
          promoted_at = EXCLUDED.promoted_at,
          lock_version = storage_objects.lock_version + 1,
          updated_at = now()
      `;
      await client.query(assetQuery, [
        asset.id,
        asset.storageProvider,
        asset.bucketName,
        asset.objectPath,
        asset.providerObjectId,
        asset.originalFilename,
        asset.detectedMimeType,
        asset.detectedExtension,
        asset.sizeBytes,
        asset.etag,
        asset.storageClass,
        asset.integrityStatus,
        asset.securityStatus,
        asset.availabilityStatus,
        asset.uploadedAt,
        asset.validatedAt,
        asset.promotedAt,
        asset.retentionUntil,
        asset.lockVersion,
      ]);

      // In case upload sessions are mapped, update upload status
      await client.query(
        `UPDATE public.upload_sessions 
         SET upload_status = $1, completed_at = $2, updated_at = now()
         WHERE id = $3`,
        [
          asset.availabilityStatus === 'available' ? 'uploaded' : 'uploading',
          asset.promotedAt,
          asset.id,
        ]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<StorageAsset | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.storage_objects WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async findByPath(bucketName: string, objectPath: string): Promise<StorageAsset | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.storage_objects WHERE bucket_name = $1 AND object_path = $2 AND deleted_at IS NULL`,
      [bucketName, objectPath]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async findByChecksum(checksum: string): Promise<StorageAsset | null> {
    const res = await this.pool.query(
      `SELECT so.* FROM public.storage_objects so
       JOIN public.resource_checksums rc ON rc.storage_object_id = so.id
       WHERE rc.checksum_value = $1 AND so.deleted_at IS NULL
       LIMIT 1`,
      [checksum]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  private mapToAggregate(row: any): StorageAsset {
    return new StorageAsset(
      row.id,
      row.storage_provider,
      row.bucket_name,
      row.object_path,
      row.provider_object_id,
      row.original_filename,
      row.detected_mime_type,
      row.detected_extension,
      Number(row.size_bytes),
      row.etag,
      row.storage_class,
      row.integrity_status as 'unchecked' | 'validated' | 'failed',
      row.security_status as
        'unchecked' | 'scanning' | 'validated_clear' | 'quarantined' | 'failed',
      row.availability_status as
        'unavailable' | 'available' | 'archived' | 'deletion_pending' | 'deleted',
      row.uploaded_at,
      row.validated_at,
      row.promoted_at,
      row.retention_until,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }
}
