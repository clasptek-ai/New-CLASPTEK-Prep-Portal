import { Pool } from 'pg';
import {
  ResourceVersion,
  ResourceVersionRepository,
  VersionStatus,
} from '@clasptek/domain-learning-resources';
import { randomUUID } from 'crypto';

export class PostgresResourceVersionRepository implements ResourceVersionRepository {
  private readonly pool: Pool;
  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public async save(version: ResourceVersion): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert or update core resource_versions row
      const verQuery = `
        INSERT INTO public.resource_versions (
          id, resource_variant_id, version_no, status, title, description,
          resource_format_id, version_label, change_summary, source_attribution,
          copyright_owner, copyright_year, license_id, estimated_study_minutes,
          requires_preview, allows_download, allows_streaming, effective_from,
          effective_to, reviewed_at, reviewed_by, published_at, published_by,
          retired_at, retired_by, lock_version, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, now())
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          estimated_study_minutes = EXCLUDED.estimated_study_minutes,
          published_at = EXCLUDED.published_at,
          published_by = EXCLUDED.published_by,
          retired_at = EXCLUDED.retired_at,
          retired_by = EXCLUDED.retired_by,
          lock_version = resource_versions.lock_version + 1,
          updated_at = now()
      `;
      await client.query(verQuery, [
        version.id,
        version.resourceVariantId,
        version.versionNo,
        version.status.value,
        version.title,
        version.description,
        version.resourceFormatId,
        version.versionLabel,
        version.changeSummary,
        version.sourceAttribution,
        version.copyrightOwner,
        version.copyrightYear,
        version.licenseId,
        version.estimatedStudyMinutes,
        version.requiresPreview,
        version.allowsDownload,
        version.allowsStreaming,
        version.effectiveFrom,
        version.effectiveTo,
        version.reviewedAt,
        version.reviewedBy,
        version.publishedAt,
        version.publishedBy,
        version.retiredAt,
        version.retiredBy,
        version.lockVersion,
      ]);

      // 2. Sync metadata map
      // Delete existing metadata
      await client.query(`DELETE FROM public.resource_metadata WHERE resource_version_id = $1`, [
        version.id,
      ]);

      // Re-insert metadata entries
      for (const [key, val] of version.metadata.entries()) {
        // Query to find metadata_definition_id by namespace/key
        const parts = key.split('.');
        const namespace = parts.length > 1 ? parts[0] : 'custom';
        const metaKey = parts.length > 1 ? parts.slice(1).join('.') : key;

        const defRes = await client.query(
          `SELECT id FROM public.resource_metadata_definitions WHERE namespace = $1 AND metadata_key = $2`,
          [namespace, metaKey]
        );
        let defId = defRes.rows[0]?.id;
        if (!defId) {
          defId = randomUUID();
          await client.query(
            `INSERT INTO public.resource_metadata_definitions (id, namespace, metadata_key, name) VALUES ($1, $2, $3, $4)`,
            [defId, namespace, metaKey, `${namespace} ${metaKey}`]
          );
        }

        await client.query(
          `INSERT INTO public.resource_metadata (id, resource_version_id, metadata_definition_id, metadata_value_json)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [version.id, defId, JSON.stringify(val)]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<ResourceVersion | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.resource_versions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async findByVariantAndNo(
    variantId: string,
    versionNo: number
  ): Promise<ResourceVersion | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.resource_versions WHERE resource_variant_id = $1 AND version_no = $2 AND deleted_at IS NULL`,
      [variantId, versionNo]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  private async mapToAggregate(row: any): Promise<ResourceVersion> {
    const metaRes = await this.pool.query(
      `SELECT md.namespace, md.metadata_key, m.metadata_value_json 
       FROM public.resource_metadata m
       JOIN public.resource_metadata_definitions md ON m.metadata_definition_id = md.id
       WHERE m.resource_version_id = $1`,
      [row.id]
    );

    const version = new ResourceVersion(
      row.id,
      row.resource_variant_id,
      Number(row.version_no),
      new VersionStatus(row.status),
      row.title,
      row.description,
      row.resource_format_id,
      row.version_label,
      row.change_summary,
      row.source_attribution,
      row.copyright_owner,
      row.copyright_year,
      row.license_id,
      Number(row.estimated_study_minutes),
      row.requires_preview,
      row.allows_download,
      row.allows_streaming,
      row.effective_from,
      row.effective_to,
      row.reviewed_at,
      row.reviewed_by,
      row.published_at,
      row.published_by,
      row.retired_at,
      row.retired_by,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    metaRes.rows.forEach((m) => {
      const fullKey = `${m.namespace}.${m.metadata_key}`;
      const val =
        typeof m.metadata_value_json === 'string'
          ? m.metadata_value_json
          : JSON.stringify(m.metadata_value_json);
      const cleanVal = val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val;
      version.metadata.set(fullKey, cleanVal);
    });

    return version;
  }
}
