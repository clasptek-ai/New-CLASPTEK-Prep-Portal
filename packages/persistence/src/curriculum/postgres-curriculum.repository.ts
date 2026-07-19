import { Pool } from 'pg';
import {
  Curriculum,
  CurriculumCode,
  CurriculumStatus,
  CurriculumRepository,
  CurriculumVersion,
  DependencyVersion,
  DependencyLock,
  CurriculumLocale,
  Translation
} from '@clasptek/domain-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresCurriculumRepository implements CurriculumRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public async findById(id: string): Promise<Curriculum | null> {
    const res = await this.pool.query(
      'SELECT * FROM curricula WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const curriculum = new Curriculum(
      row.id,
      new CurriculumCode(row.code),
      row.slug,
      row.name,
      row.description || '',
      new CurriculumStatus(row.status as any),
      row.current_version_id || undefined,
      row.current_version_no || undefined,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    const verRes = await this.pool.query(
      'SELECT * FROM curriculum_versions WHERE curriculum_id = $1 AND deleted_at IS NULL',
      [id]
    );
    for (const vRow of verRes.rows) {
      const v = new CurriculumVersion(
        vRow.id,
        vRow.curriculum_id,
        new DependencyVersion(vRow.version_no),
        vRow.status,
        vRow.name,
        vRow.description || '',
        vRow.effective_from || undefined,
        vRow.effective_until || undefined,
        vRow.superseded_by || undefined,
        vRow.breaking_change,
        vRow.migration_notes || '',
        Number(vRow.lock_version),
        vRow.created_at,
        vRow.updated_at,
        vRow.deleted_at
      );

      const locksRes = await this.pool.query(
        'SELECT * FROM curriculum_dependency_locks WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
        [vRow.id]
      );
      v.dependencyLocks = locksRes.rows.map(
        r => new DependencyLock(r.id, r.curriculum_version_id, r.dependency_type, r.dependency_id, r.locked_version_no, r.locked_at)
      );

      const localesRes = await this.pool.query(
        'SELECT * FROM curriculum_locales WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
        [vRow.id]
      );
      v.locales = localesRes.rows.map(
        r => new CurriculumLocale(r.id, r.curriculum_version_id, r.language_code, r.is_default, r.is_required_for_publication, r.translation_status, r.display_order)
      );

      const metaRes = await this.pool.query(
        'SELECT * FROM curriculum_metadata WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
        [vRow.id]
      );
      metaRes.rows.forEach(r => {
        v.metadata.set(r.metadata_key, r.metadata_value);
      });

      const transRes = await this.pool.query(
        'SELECT * FROM curriculum_version_translations WHERE parent_entity_id = $1 AND deleted_at IS NULL',
        [vRow.id]
      );
      v.translations = transRes.rows.map(
        r => new Translation(r.id, r.parent_entity_id, r.language_code, r.localized_name, undefined, r.localized_description, undefined, r.source_language_code, r.translation_method, r.translation_status)
      );

      curriculum.versions.push(v);
    }

    return curriculum;
  }

  public async findByCode(code: CurriculumCode): Promise<Curriculum | null> {
    const res = await this.pool.query(
      'SELECT id FROM curricula WHERE code = $1 AND deleted_at IS NULL LIMIT 1',
      [code.value]
    );
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async save(curriculum: Curriculum): Promise<void> {
    const cur = await this.findById(curriculum.id);
    if (cur) {
      await this.pool.query(
        `UPDATE curricula 
         SET name = $1, description = $2, slug = $3, status = $4, 
             current_version_id = $5, current_version_no = $6, lock_version = $7, updated_at = now() 
         WHERE id = $8`,
        [
          curriculum.name,
          curriculum.description,
          curriculum.slug,
          curriculum.status.value,
          curriculum.currentVersionId || null,
          curriculum.currentVersionNo || null,
          curriculum.lockVersion,
          curriculum.id
        ]
      );
    } else {
      await this.pool.query(
        `INSERT INTO curricula 
         (id, code, name, description, slug, status, current_version_id, current_version_no, lock_version, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
        [
          curriculum.id,
          curriculum.code.value,
          curriculum.name,
          curriculum.description,
          curriculum.slug,
          curriculum.status.value,
          curriculum.currentVersionId || null,
          curriculum.currentVersionNo || null,
          curriculum.lockVersion
        ]
      );
    }
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE curricula SET deleted_at = now() WHERE id = $1',
      [id]
    );
  }

  public async search(filters: any): Promise<Curriculum[]> {
    let query = 'SELECT id FROM curricula WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (filters && filters.status) {
      params.push(filters.status.toLowerCase());
      query += ` AND status = $${params.length}`;
    }
    if (filters && filters.code) {
      params.push(filters.code);
      query += ` AND code = $${params.length}`;
    }
    const res = await this.pool.query(query, params);
    const curricula: Curriculum[] = [];
    for (const row of res.rows) {
      const cur = await this.findById(row.id);
      if (cur) curricula.push(cur);
    }
    return curricula;
  }
}
