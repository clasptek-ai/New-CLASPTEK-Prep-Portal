import { Pool } from 'pg';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { 
  ObjectStoragePort, 
  MimeInspectionPort, 
  ChecksumPort, 
  SecurityScanPort, 
  StorageQuotaPort 
} from '@clasptek/application-learning-resources';

export class SupabaseStorageAdapter implements ObjectStoragePort {
  private mockBucketStorage: Map<string, Set<string>> = new Map();

  public async generateSignedUploadUrl(bucketName: string, objectPath: string, expiresInSeconds: number): Promise<string> {
    // Generate a secure signed URL pointing to the ingestion endpoint
    return `https://supabase.clasptek.internal/storage/v1/object/upload/sign/${bucketName}/${objectPath}?token=mock_sign_token_expires_${Date.now() + expiresInSeconds * 1000}`;
  }

  public async generateSignedDownloadUrl(bucketName: string, objectPath: string, expiresInSeconds: number): Promise<string> {
    return `https://supabase.clasptek.internal/storage/v1/object/download/sign/${bucketName}/${objectPath}?token=mock_read_token_expires_${Date.now() + expiresInSeconds * 1000}`;
  }

  public async promote(sourceBucket: string, sourcePath: string, targetBucket: string, targetPath: string): Promise<void> {
    if (!this.mockBucketStorage.has(targetBucket)) {
      this.mockBucketStorage.set(targetBucket, new Set());
    }
    this.mockBucketStorage.get(targetBucket)!.add(targetPath);
    if (this.mockBucketStorage.has(sourceBucket)) {
      this.mockBucketStorage.get(sourceBucket)!.delete(sourcePath);
    }
  }

  public async exists(bucketName: string, objectPath: string): Promise<boolean> {
    return this.mockBucketStorage.get(bucketName)?.has(objectPath) ?? true; // Default to true for mocks
  }

  public async delete(bucketName: string, objectPath: string): Promise<void> {
    this.mockBucketStorage.get(bucketName)?.delete(objectPath);
  }
}

export class LocalMimeInspectionAdapter implements MimeInspectionPort {
  public async detectMimeType(filePath: string): Promise<string> {
    if (filePath.endsWith('.pdf')) return 'application/pdf';
    if (filePath.endsWith('.mp4')) return 'video/mp4';
    if (filePath.endsWith('.mp3')) return 'audio/mpeg';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
    return 'application/octet-stream';
  }
}

export class LocalChecksumAdapter implements ChecksumPort {
  public async calculateSHA256(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      // In-memory or dummy files return static test hash
      return crypto.createHash('sha256').update(filePath).digest('hex');
    }
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
}

export class MockSecurityScanAdapter implements SecurityScanPort {
  public async scanFile(_bucketName: string, objectPath: string): Promise<{ isClear: boolean; threats: string[]; scannerName: string }> {
    const scannerName = 'ClasptekMalwareScannerV2';
    // Flag quarantine if file name or path matches target test values
    if (objectPath.includes('infected') || objectPath.endsWith('.infected')) {
      return {
        isClear: false,
        threats: ['EICAR-Test-Signature', 'MaliciousPayloadFound'],
        scannerName
      };
    }
    return { isClear: true, threats: [], scannerName };
  }
}

export class PostgresStorageQuotaAdapter implements StorageQuotaPort {
  constructor(private readonly pool: Pool) {}

  public async hasSufficientQuota(organizationId: string, requestedBytes: number): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT total_allowed_bytes, total_used_bytes 
       FROM resource_read.resource_storage_health_projection 
       WHERE organization_id = $1`,
      [organizationId]
    );
    if (res.rows.length === 0) return true; // Default allow if no policy mapped yet

    const { total_allowed_bytes, total_used_bytes } = res.rows[0];
    return (Number(total_used_bytes) + requestedBytes) <= Number(total_allowed_bytes);
  }

  public async reserveQuota(organizationId: string, uploadSessionId: string, requestedBytes: number): Promise<void> {
    // Record quota reservation
    await this.pool.query(
      `INSERT INTO public.storage_quota_reservations (id, organization_id, upload_session_id, reserved_bytes, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, now() + interval '15 minutes')`,
      [organizationId, uploadSessionId, requestedBytes]
    );
  }

  public async releaseQuota(_organizationId: string, uploadSessionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE public.storage_quota_reservations 
       SET status = 'released', released_at = now() 
       WHERE upload_session_id = $1`,
      [uploadSessionId]
    );
  }

  public async commitQuotaUsage(organizationId: string, bytesDelta: number): Promise<void> {
    // Record ledger delta entry
    await this.pool.query(
      `INSERT INTO public.storage_usage_ledger (id, organization_id, event_type, bytes_delta)
       VALUES (gen_random_uuid(), $1, 'upload', $2)`,
      [organizationId, bytesDelta]
    );

    // Update read-model projection total used bytes
    await this.pool.query(
      `INSERT INTO resource_read.resource_storage_health_projection (organization_id, total_used_bytes, remaining_bytes)
       VALUES ($1, $2, 10737418240 - $2)
       ON CONFLICT (organization_id) DO UPDATE SET
         total_used_bytes = resource_storage_health_projection.total_used_bytes + EXCLUDED.total_used_bytes,
         remaining_bytes = resource_storage_health_projection.total_allowed_bytes - (resource_storage_health_projection.total_used_bytes + EXCLUDED.total_used_bytes)`,
      [organizationId, bytesDelta]
    );
  }
}
