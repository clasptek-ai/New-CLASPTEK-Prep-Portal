import { Pool } from 'pg';
import {
  CurriculumTemplate,
  CurriculumTemplateRepository,
  CurriculumTemplateVersion,
} from '@clasptek/domain-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresCurriculumTemplateRepository implements CurriculumTemplateRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public async findById(id: string): Promise<CurriculumTemplate | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.curriculum_templates WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const template = new CurriculumTemplate(
      row.id,
      row.code,
      row.slug,
      row.name,
      row.description || '',
      row.status,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Load versions
    const verRes = await this.pool.query(
      'SELECT * FROM public.curriculum_template_versions WHERE template_id = $1 AND deleted_at IS NULL',
      [id]
    );
    template.versions = verRes.rows.map(
      (r) =>
        new CurriculumTemplateVersion(
          r.id,
          r.template_id,
          r.version_no,
          r.name,
          r.description || '',
          JSON.stringify(r.structure_snapshot_json),
          r.status
        )
    );

    return template;
  }

  public async findByCode(code: string): Promise<CurriculumTemplate | null> {
    const res = await this.pool.query(
      'SELECT id FROM public.curriculum_templates WHERE code = $1 AND deleted_at IS NULL LIMIT 1',
      [code]
    );
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async save(template: CurriculumTemplate): Promise<void> {
    const existing = await this.findById(template.id);
    if (existing) {
      await this.pool.query(
        `UPDATE public.curriculum_templates 
         SET code = $1, slug = $2, name = $3, description = $4, status = $5, 
             lock_version = $6, updated_at = now() 
         WHERE id = $7`,
        [
          template.code,
          template.slug,
          template.name,
          template.description,
          template.status,
          template.lockVersion,
          template.id,
        ]
      );
    } else {
      await this.pool.query(
        `INSERT INTO public.curriculum_templates 
         (id, code, slug, name, description, status, lock_version, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
        [
          template.id,
          template.code,
          template.slug,
          template.name,
          template.description,
          template.status,
          template.lockVersion,
        ]
      );
    }

    // Save versions
    await this.pool.query(
      'UPDATE public.curriculum_template_versions SET deleted_at = now() WHERE template_id = $1',
      [template.id]
    );
    for (const ver of template.versions) {
      await this.pool.query(
        `INSERT INTO public.curriculum_template_versions 
         (id, template_id, version_no, name, description, structure_snapshot_json, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [
          ver.id,
          ver.templateId,
          ver.versionNo,
          ver.name,
          ver.description || null,
          JSON.parse(ver.structureSnapshotJson),
          ver.status,
        ]
      );
    }
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE public.curriculum_templates SET deleted_at = now() WHERE id = $1',
      [id]
    );
  }
}
