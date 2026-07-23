import { Pool } from 'pg';

export interface SearchFiltersDTO {
  resourceType?: string;
  categoryCode?: string;
  tag?: string;
  language?: string;
  sensitivity?: string;
}

export interface ResourceSummaryDTO {
  resourceId: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  resourceType: string;
  categoryName: string;
  defaultLanguageCode: string;
  sensitivity: string;
  visibility: string;
  status: string;
}

export interface BrokenLinkDTO {
  externalLocationId: string;
  resourceVersionId: string;
  title: string;
  brokenUrl: string;
  httpStatusCode: number;
  errorMessage: string;
  lastCheckedAt: Date;
}

export interface DuplicateReportDTO {
  checksumValue: string;
  duplicateCount: number;
  potentialSavingsBytes: number;
  resourceVersionIds: string[];
}

export class SearchResourcesHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(filters: SearchFiltersDTO): Promise<ResourceSummaryDTO[]> {
    let sql = `
      SELECT 
        resource_id as "resourceId",
        code,
        slug,
        title,
        description,
        resource_type as "resourceType",
        category_name as "categoryName",
        default_language_code as "defaultLanguageCode",
        sensitivity,
        visibility,
        status
      FROM resource_read.resource_summary_projection
      WHERE status <> 'archived'
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (filters.resourceType) {
      sql += ` AND resource_type = $${pIdx++}`;
      params.push(filters.resourceType);
    }
    if (filters.language) {
      sql += ` AND default_language_code = $${pIdx++}`;
      params.push(filters.language);
    }
    if (filters.sensitivity) {
      sql += ` AND sensitivity = $${pIdx++}`;
      params.push(filters.sensitivity);
    }

    const res = await this.pool.query(sql, params);
    return res.rows;
  }
}

export class GetResourceDetailHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(resourceId: string): Promise<any | null> {
    const resourceRes = await this.pool.query(
      `SELECT * FROM public.learning_resources WHERE id = $1`,
      [resourceId]
    );
    if (resourceRes.rows.length === 0) return null;

    const row = resourceRes.rows[0];
    const variantsRes = await this.pool.query(
      `SELECT * FROM public.resource_variants WHERE learning_resource_id = $1`,
      [resourceId]
    );

    const variantIds = variantsRes.rows.map((v: any) => v.id);
    const versions: any[] = [];
    if (variantIds.length > 0) {
      const versionsRes = await this.pool.query(
        `SELECT * FROM public.resource_versions 
         WHERE resource_variant_id = ANY($1) AND deleted_at IS NULL`,
        [variantIds]
      );

      for (const vRow of versionsRes.rows) {
        const objectsRes = await this.pool.query(
          `SELECT rvo.object_role, so.* 
           FROM public.resource_version_objects rvo
           JOIN public.storage_objects so ON rvo.storage_object_id = so.id
           WHERE rvo.resource_version_id = $1 AND rvo.deleted_at IS NULL`,
          [vRow.id]
        );

        const metadataRes = await this.pool.query(
          `SELECT md.namespace, md.metadata_key, m.metadata_value_json 
           FROM public.resource_metadata m
           JOIN public.resource_metadata_definitions md ON m.metadata_definition_id = md.id
           WHERE m.resource_version_id = $1`,
          [vRow.id]
        );
        const metadataMap = new Map<string, string>();
        metadataRes.rows.forEach((m) => {
          const fullKey = `${m.namespace}.${m.metadata_key}`;
          const val =
            typeof m.metadata_value_json === 'string'
              ? m.metadata_value_json
              : JSON.stringify(m.metadata_value_json);
          // Strip outer quotes if it's a JSON string representing a primitive
          const cleanVal = val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val;
          metadataMap.set(fullKey, cleanVal);
          metadataMap.set(m.metadata_key, cleanVal);
        });

        const mediaObj = objectsRes.rows.find((o) => o.object_role === 'primary');
        const attachments = objectsRes.rows
          .filter((o) => o.object_role === 'attachment')
          .map((o) => ({
            id: o.id,
            name: o.original_filename || 'Attachment',
            fileSize: Number(o.size_bytes),
            mimeType: o.detected_mime_type,
            objectKey: o.object_path,
          }));
        const transcripts = objectsRes.rows
          .filter((o) => o.object_role === 'transcript')
          .map((o) => ({
            id: o.id,
            transcriptText: o.original_filename || 'Transcript text',
            language: 'en',
          }));
        const captions = objectsRes.rows
          .filter((o) => o.object_role === 'captions')
          .map((o) => ({
            id: o.id,
            captionText: o.original_filename || 'Caption text',
            language: 'en',
          }));

        versions.push({
          id: vRow.id,
          versionNo: vRow.version_no,
          status: vRow.status,
          name: vRow.title,
          description: vRow.description,
          mediaAsset: mediaObj
            ? {
                id: mediaObj.id,
                provider: mediaObj.storage_provider,
                bucket: mediaObj.bucket_name,
                objectKey: mediaObj.object_path,
                region: '',
                checksum: mediaObj.etag || '',
                mimeType: mediaObj.detected_mime_type,
                size: Number(mediaObj.size_bytes),
                duration: null,
              }
            : null,
          attachments,
          downloads: [],
          externalLinks: [],
          transcripts,
          captions,
          metadata: metadataMap,
        });
      }
    }

    return {
      id: row.id,
      code: row.code,
      slug: row.slug,
      title: row.canonical_title,
      description: row.canonical_description,
      resourceTypeId: row.resource_type_id,
      primaryCategoryId: row.primary_category_id,
      sensitivity: row.sensitivity,
      visibility: row.visibility,
      status: row.status,
      variants: variantsRes.rows.map((v: any) => ({
        id: v.id,
        code: v.code,
        languageCode: v.language_code,
        variantPurpose: v.variant_purpose,
        isDefault: v.is_default,
        currentPublishedVersionId: v.current_published_version_id,
      })),
      versions,
    };
  }
}

export class GetBrokenLinksHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(): Promise<BrokenLinkDTO[]> {
    const res = await this.pool.query(`
      SELECT 
        external_location_id as "externalLocationId",
        resource_version_id as "resourceVersionId",
        title,
        broken_url as "brokenUrl",
        http_status_code as "httpStatusCode",
        error_message as "errorMessage",
        last_checked_at as "lastCheckedAt"
      FROM resource_read.resource_broken_link_projection
      ORDER BY detected_at DESC
    `);
    return res.rows;
  }
}

export class GetDuplicatesHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(): Promise<DuplicateReportDTO[]> {
    const res = await this.pool.query(`
      SELECT 
        checksum_value as "checksumValue",
        duplicate_count as "duplicateCount",
        potential_savings_bytes as "potentialSavingsBytes",
        resource_version_ids as "resourceVersionIds"
      FROM resource_read.resource_duplicate_projection
      WHERE duplicate_count > 1
      ORDER BY potential_savings_bytes DESC
    `);
    return res.rows;
  }
}

export class GetStorageStatsHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(organizationId: string): Promise<any | null> {
    const res = await this.pool.query(
      `SELECT 
        organization_id as "organizationId",
        total_allowed_bytes as "totalAllowedBytes",
        total_used_bytes as "totalUsedBytes",
        remaining_bytes as "remainingBytes",
        ingested_bytes_30_days as "ingestedBytes30Days",
        quarantined_bytes as "quarantinedBytes",
        health_status as "healthStatus"
       FROM resource_read.resource_storage_health_projection
       WHERE organization_id = $1`,
      [organizationId]
    );
    return res.rows[0] || null;
  }
}
