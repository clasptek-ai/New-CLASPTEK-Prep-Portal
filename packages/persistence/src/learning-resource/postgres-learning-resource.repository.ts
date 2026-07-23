import { Pool } from 'pg';
import {
  LearningResource,
  ResourceVariant,
  LearningResourceRepository,
  ResourceCode,
  ResourceStatus,
  SensitivityLevel,
  VisibilityScope,
  VariantPurpose,
} from '@clasptek/domain-learning-resources';
import { randomUUID } from 'crypto';

export class PostgresLearningResourceRepository implements LearningResourceRepository {
  private readonly pool: Pool;
  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public async save(resource: LearningResource): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Check concurrency
      const lockRes = await client.query(
        'SELECT lock_version FROM public.learning_resources WHERE id = $1',
        [resource.id]
      );
      if (lockRes.rows.length > 0) {
        const currentLock = Number(lockRes.rows[0].lock_version);
        if (currentLock !== resource.lockVersion) {
          throw new Error('Concurrency violation: Resource has been modified by another process.');
        }
      }

      // 1. Insert or update core learning_resources row
      const resQuery = `
        INSERT INTO public.learning_resources (
          id, code, slug, canonical_title, canonical_description, resource_type_id,
          primary_category_id, sensitivity, visibility, owner_organization_id,
          default_language_code, current_default_variant_id, status, version_no, lock_version, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now())
        ON CONFLICT (id) DO UPDATE SET
          canonical_title = EXCLUDED.canonical_title,
          canonical_description = EXCLUDED.canonical_description,
          primary_category_id = EXCLUDED.primary_category_id,
          sensitivity = EXCLUDED.sensitivity,
          visibility = EXCLUDED.visibility,
          status = EXCLUDED.status,
          current_default_variant_id = EXCLUDED.current_default_variant_id,
          lock_version = learning_resources.lock_version + 1,
          updated_at = now()
      `;
      await client.query(resQuery, [
        resource.id,
        resource.code.value,
        resource.slug,
        resource.canonicalTitle,
        resource.canonicalDescription,
        resource.resourceTypeId,
        resource.primaryCategoryId,
        resource.sensitivity.value,
        resource.visibility.value,
        resource.ownerOrganizationId,
        resource.defaultLanguageCode,
        resource.currentDefaultVariantId,
        resource.status.value,
        1, // version_no defaults to 1
        resource.lockVersion,
      ]);

      // 2. Sync variants (upsert active variants, delete inactive if necessary)
      for (const variant of resource.variants) {
        const varQuery = `
          INSERT INTO public.resource_variants (
            id, learning_resource_id, code, language_code, region_code,
            accessibility_profile, variant_purpose, is_default,
            current_published_version_id, current_version_no, status, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
          ON CONFLICT (learning_resource_id, code) DO UPDATE SET
            language_code = EXCLUDED.language_code,
            is_default = EXCLUDED.is_default,
            current_published_version_id = EXCLUDED.current_published_version_id,
            current_version_no = EXCLUDED.current_version_no,
            status = EXCLUDED.status,
            updated_at = now()
        `;
        await client.query(varQuery, [
          variant.id,
          variant.learningResourceId,
          variant.code,
          variant.languageCode,
          variant.regionCode,
          variant.accessibilityProfile,
          variant.variantPurpose.value,
          variant.isDefault,
          variant.currentPublishedVersionId,
          variant.currentVersionNo,
          variant.status,
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<LearningResource | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.learning_resources WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<LearningResource | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.learning_resources WHERE code = $1 AND deleted_at IS NULL`,
      [code]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT 1 FROM public.learning_resources WHERE code = $1 AND deleted_at IS NULL`,
      [code]
    );
    return res.rows.length > 0;
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  private async mapToAggregate(row: any): Promise<LearningResource> {
    const variantsRes = await this.pool.query(
      `SELECT * FROM public.resource_variants WHERE learning_resource_id = $1 AND deleted_at IS NULL`,
      [row.id]
    );

    const resource = new LearningResource(
      row.id,
      new ResourceCode(row.code),
      row.slug,
      row.canonical_title,
      row.canonical_description,
      row.resource_type_id,
      row.primary_category_id,
      new SensitivityLevel(row.sensitivity),
      new VisibilityScope(row.visibility),
      row.owner_organization_id,
      row.default_language_code,
      row.current_default_variant_id,
      new ResourceStatus(row.status),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    const variants = variantsRes.rows.map(
      (v) =>
        new ResourceVariant(
          v.id,
          v.learning_resource_id,
          v.code,
          v.language_code,
          v.region_code,
          v.accessibility_profile,
          new VariantPurpose(v.variant_purpose),
          v.is_default,
          v.current_published_version_id,
          v.current_version_no,
          v.status
        )
    );

    resource.setVariants(variants);
    return resource;
  }
}
