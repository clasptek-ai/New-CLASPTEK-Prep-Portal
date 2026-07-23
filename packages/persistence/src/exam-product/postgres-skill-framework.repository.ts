import {
  SkillFrameworkRepository,
  SkillFramework,
  SkillFrameworkVersion,
  Skill,
  SkillRevision,
  SkillFrameworkLevel,
} from '@clasptek/domain-exam-product';
import {
  SkillHierarchyReadService,
  SkillHierarchyReadModel,
} from '@clasptek/application-exam-product';
import { SkillCode } from '@clasptek/domain-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresSkillFrameworkRepository
  implements SkillFrameworkRepository, SkillHierarchyReadService
{
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<SkillFramework | null> {
    const res = await this.client.query(
      'SELECT * FROM skill_frameworks WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<SkillFramework | null> {
    const res = await this.client.query(
      'SELECT * FROM skill_frameworks WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query(
      'SELECT 1 FROM skill_frameworks WHERE code = $1 AND deleted_at IS NULL LIMIT 1',
      [code]
    );
    return res.rows.length > 0;
  }

  public async save(framework: SkillFramework): Promise<void> {
    await this.client.query(
      `INSERT INTO skill_frameworks (id, code, name, description, status, current_version_id, current_version_no, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         current_version_id = EXCLUDED.current_version_id,
         current_version_no = EXCLUDED.current_version_no,
         updated_at = now()`,
      [
        framework.id,
        framework.code,
        framework.name,
        framework.description || null,
        framework.status,
        framework.currentVersionId || null,
        framework.currentVersionNo || null,
        framework.versionNo,
        framework.lockVersion,
        framework.createdAt,
        framework.updatedAt,
      ]
    );

    // Save versions
    for (const v of framework.versions) {
      await this.client.query(
        `INSERT INTO skill_framework_versions (id, skill_framework_id, version_no, status, name, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           name = EXCLUDED.name`,
        [v.id, framework.id, v.versionNo, v.status, v.name, v.description || null]
      );
    }

    // Save skills
    for (const s of framework.skills) {
      await this.client.query(
        `INSERT INTO skills (id, skill_framework_id, code, canonical_name, status, current_revision_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           canonical_name = EXCLUDED.canonical_name,
           current_revision_id = EXCLUDED.current_revision_id,
           status = EXCLUDED.status`,
        [s.id, framework.id, s.code.value, s.canonicalName, s.status, s.currentRevisionId || null]
      );
    }

    // Save revisions
    for (const r of framework.revisions) {
      await this.client.query(
        `INSERT INTO skill_revisions (id, skill_id, skill_framework_version_id, revision_no, name, parent_skill_revision_id, description, category, domain, is_leaf_skill, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           status = EXCLUDED.status`,
        [
          r.id,
          r.skillId,
          r.skillFrameworkVersionId,
          r.revisionNo,
          r.name,
          r.parentSkillRevisionId || null,
          r.description || null,
          r.category || null,
          r.domain || null,
          r.isLeafSkill,
          r.status,
        ]
      );
    }

    // Save levels
    for (const l of framework.levels) {
      await this.client.query(
        `INSERT INTO skill_levels (id, skill_framework_version_id, code, name, description, ordinal_position, minimum_mastery_percentage, maximum_mastery_percentage, equivalent_framework, equivalent_level, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           status = EXCLUDED.status`,
        [
          l.id,
          l.skillFrameworkVersionId,
          l.code,
          l.name,
          l.description || null,
          l.ordinalPosition,
          l.minimumMasteryPercentage || null,
          l.maximumMasteryPercentage || null,
          l.equivalentFramework || null,
          l.equivalentLevel || null,
          l.status,
        ]
      );
    }
  }

  // Read Model Queries
  public async getSkillHierarchy(frameworkVersionId: string): Promise<SkillHierarchyReadModel[]> {
    const res = await this.client.query(
      'SELECT * FROM vw_skill_hierarchy WHERE skill_framework_version_id = $1',
      [frameworkVersionId]
    );
    return res.rows.map((r: any) => ({
      skillRevisionId: r.skill_revision_id,
      skillId: r.skill_id,
      skillFrameworkVersionId: r.skill_framework_version_id,
      parentSkillRevisionId: r.parent_skill_revision_id || undefined,
      skillName: r.skill_name,
      category: r.category || undefined,
      domain: r.domain || undefined,
      isLeafSkill: r.is_leaf_skill,
      depth: Number(r.depth),
      path: r.path || [],
    }));
  }

  private async _hydrate(row: any): Promise<SkillFramework> {
    const framework = new SkillFramework(
      row.id,
      row.code,
      row.name,
      row.description || undefined,
      row.status,
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
    framework.currentVersionId = row.current_version_id || undefined;
    framework.currentVersionNo = row.current_version_no || undefined;

    // Hydrate versions
    const verRes = await this.client.query(
      'SELECT * FROM skill_framework_versions WHERE skill_framework_id = $1 AND deleted_at IS NULL',
      [framework.id]
    );
    framework.loadVersions(
      verRes.rows.map(
        (v: any) =>
          new SkillFrameworkVersion(
            v.id,
            v.skill_framework_id,
            v.version_no,
            v.status,
            v.name,
            v.description || undefined,
            v.published_at || undefined,
            v.published_by || undefined
          )
      )
    );

    // Hydrate skills
    const skillRes = await this.client.query(
      'SELECT * FROM skills WHERE skill_framework_id = $1 AND deleted_at IS NULL',
      [framework.id]
    );
    framework.loadSkills(
      skillRes.rows.map(
        (s: any) =>
          new Skill(
            s.id,
            s.skill_framework_id,
            new SkillCode(s.code),
            s.canonical_name,
            s.status,
            s.current_revision_id || undefined
          )
      )
    );

    // Hydrate revisions
    const revRes = await this.client.query(
      `SELECT r.* FROM skill_revisions r 
       JOIN skills s ON r.skill_id = s.id 
       WHERE s.skill_framework_id = $1 AND r.deleted_at IS NULL`,
      [framework.id]
    );
    framework.loadRevisions(
      revRes.rows.map(
        (r: any) =>
          new SkillRevision(
            r.id,
            r.skill_id,
            r.skill_framework_version_id,
            Number(r.revision_no),
            r.name,
            r.parent_skill_revision_id || undefined,
            r.description || undefined,
            r.category || undefined,
            r.domain || undefined,
            r.is_leaf_skill,
            r.status
          )
      )
    );

    // Hydrate levels
    const lvlRes = await this.client.query(
      `SELECT l.* FROM skill_levels l
       JOIN skill_framework_versions v ON l.skill_framework_version_id = v.id
       WHERE v.skill_framework_id = $1 AND l.deleted_at IS NULL`,
      [framework.id]
    );
    framework.loadLevels(
      lvlRes.rows.map(
        (l: any) =>
          new SkillFrameworkLevel(
            l.id,
            l.skill_framework_version_id,
            l.code,
            l.name,
            l.description || undefined,
            Number(l.ordinal_position),
            l.minimum_mastery_percentage ? Number(l.minimum_mastery_percentage) : undefined,
            l.maximum_mastery_percentage ? Number(l.maximum_mastery_percentage) : undefined,
            l.equivalent_framework || undefined,
            l.equivalent_level || undefined,
            l.status
          )
      )
    );

    return framework;
  }
}
