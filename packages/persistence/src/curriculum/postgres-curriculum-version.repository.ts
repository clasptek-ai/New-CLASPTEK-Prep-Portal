import { Pool } from 'pg';
import {
  CurriculumVersion,
  CurriculumVersionRepository,
  DependencyLock,
  CurriculumLocale,
  Translation,
  DependencyVersion,
} from '@clasptek/domain-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresCurriculumVersionRepository implements CurriculumVersionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public async findById(id: string): Promise<CurriculumVersion | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_versions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const version = new CurriculumVersion(
      row.id,
      row.curriculum_id,
      new DependencyVersion(row.version_no),
      row.status,
      row.name,
      row.description || '',
      row.effective_from || undefined,
      row.effective_until || undefined,
      row.superseded_by || undefined,
      row.breaking_change,
      row.migration_notes || '',
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Load dependency locks
    const locksRes = await this.pool.query(
      'SELECT * FROM curriculum_dependency_locks WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
      [id]
    );
    version.dependencyLocks = locksRes.rows.map(
      (r) =>
        new DependencyLock(
          r.id,
          r.curriculum_version_id,
          r.dependency_type,
          r.dependency_id,
          r.locked_version_no,
          r.locked_at
        )
    );

    // Load locales
    const localesRes = await this.pool.query(
      'SELECT * FROM curriculum_locales WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
      [id]
    );
    version.locales = localesRes.rows.map(
      (r) =>
        new CurriculumLocale(
          r.id,
          r.curriculum_version_id,
          r.language_code,
          r.is_default,
          r.is_required_for_publication,
          r.translation_status,
          r.display_order
        )
    );

    // Load metadata
    const metaRes = await this.pool.query(
      'SELECT * FROM curriculum_metadata WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
      [id]
    );
    metaRes.rows.forEach((r) => {
      version.metadata.set(r.metadata_key, r.metadata_value);
    });

    // Load translations
    const transRes = await this.pool.query(
      'SELECT * FROM curriculum_version_translations WHERE parent_entity_id = $1 AND deleted_at IS NULL',
      [id]
    );
    version.translations = transRes.rows.map(
      (r) =>
        new Translation(
          r.id,
          r.parent_entity_id,
          r.language_code,
          r.localized_name,
          undefined,
          r.localized_description,
          undefined,
          r.source_language_code,
          r.translation_method,
          r.translation_status
        )
    );

    return version;
  }

  public async findByCurriculumAndVersion(
    curriculumId: string,
    versionNo: string
  ): Promise<CurriculumVersion | null> {
    const res = await this.pool.query(
      'SELECT id FROM curriculum_versions WHERE curriculum_id = $1 AND version_no = $2 AND deleted_at IS NULL LIMIT 1',
      [curriculumId, versionNo]
    );
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async save(version: CurriculumVersion): Promise<void> {
    const existing = await this.findById(version.id);
    if (existing) {
      await this.pool.query(
        `UPDATE curriculum_versions 
         SET status = $1, name = $2, description = $3, effective_from = $4, 
             effective_until = $5, superseded_by = $6, breaking_change = $7, 
             migration_notes = $8, lock_version = $9, updated_at = now() 
         WHERE id = $10`,
        [
          version.status,
          version.name,
          version.description,
          version.effectiveFrom || null,
          version.effectiveUntil || null,
          version.supersededBy || null,
          version.breakingChange,
          version.migrationNotes || null,
          version.lockVersion,
          version.id,
        ]
      );
    } else {
      await this.pool.query(
        `INSERT INTO curriculum_versions 
         (id, curriculum_id, version_no, status, name, description, effective_from, effective_until, superseded_by, breaking_change, migration_notes, lock_version, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now())`,
        [
          version.id,
          version.curriculumId,
          version.versionNo.value,
          version.status,
          version.name,
          version.description,
          version.effectiveFrom || null,
          version.effectiveUntil || null,
          version.supersededBy || null,
          version.breakingChange,
          version.migrationNotes || null,
          version.lockVersion,
        ]
      );
    }

    // Save dependency locks
    await this.pool.query(
      'UPDATE curriculum_dependency_locks SET deleted_at = now() WHERE curriculum_version_id = $1',
      [version.id]
    );
    for (const lock of version.dependencyLocks) {
      await this.pool.query(
        `INSERT INTO curriculum_dependency_locks 
         (id, curriculum_version_id, dependency_type, dependency_id, locked_version_no, locked_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null, locked_version_no = EXCLUDED.locked_version_no`,
        [
          lock.id,
          lock.curriculumVersionId,
          lock.dependencyType,
          lock.dependencyId,
          lock.lockedVersionNo,
          lock.lockedAt,
        ]
      );
    }

    // Save locales
    await this.pool.query(
      'UPDATE curriculum_locales SET deleted_at = now() WHERE curriculum_version_id = $1',
      [version.id]
    );
    for (const loc of version.locales) {
      await this.pool.query(
        `INSERT INTO curriculum_locales 
         (id, curriculum_version_id, language_code, is_default, is_required_for_publication, translation_status, display_order) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null, is_default = EXCLUDED.is_default, is_required_for_publication = EXCLUDED.is_required_for_publication`,
        [
          loc.id,
          loc.curriculumVersionId,
          loc.languageCode,
          loc.isDefault,
          loc.isRequiredForPublication,
          loc.translationStatus,
          loc.displayOrder,
        ]
      );
    }

    // Save metadata
    await this.pool.query(
      'UPDATE curriculum_metadata SET deleted_at = now() WHERE curriculum_version_id = $1',
      [version.id]
    );
    for (const [k, v] of version.metadata.entries()) {
      await this.pool.query(
        `INSERT INTO curriculum_metadata (curriculum_version_id, metadata_key, metadata_value) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (curriculum_version_id, metadata_key) DO UPDATE SET deleted_at = null, metadata_value = EXCLUDED.metadata_value`,
        [version.id, k, v]
      );
    }
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query('UPDATE curriculum_versions SET deleted_at = now() WHERE id = $1', [id]);
  }
}
