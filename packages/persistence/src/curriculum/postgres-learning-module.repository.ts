import { Pool } from 'pg';
import {
  LearningModule,
  LearningModuleRepository,
  ModulePrerequisite,
  ModuleSequence,
  ModuleOutcomeMapping
} from '@clasptek/domain-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresLearningModuleRepository implements LearningModuleRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public async findById(id: string): Promise<LearningModule | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.learning_modules WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const module = new LearningModule(
      row.id,
      row.curriculum_version_id,
      row.code,
      row.slug,
      row.name,
      row.description || '',
      row.module_type,
      Number(row.default_sequence_no),
      Number(row.estimated_study_minutes),
      Number(row.minimum_study_minutes),
      Number(row.maximum_study_minutes),
      row.is_required,
      row.completion_policy,
      row.status,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Prerequisites
    const prereqRes = await this.pool.query(
      'SELECT * FROM public.module_prerequisites WHERE module_id = $1 AND deleted_at IS NULL',
      [id]
    );
    module.prerequisites = prereqRes.rows.map(
      r => new ModulePrerequisite(r.id, r.curriculum_version_id, r.module_id, r.prerequisite_module_id, r.prerequisite_type, Number(r.minimum_completion_percentage), Number(r.minimum_mastery_percentage), r.required_skill_revision_id, r.required_skill_level_id, r.is_mandatory, r.rationale, r.status)
    );

    // Sequences
    const seqRes = await this.pool.query(
      'SELECT * FROM public.module_sequences WHERE (source_module_id = $1 OR target_module_id = $1) AND deleted_at IS NULL',
      [id]
    );
    module.sequences = seqRes.rows.map(
      r => {
        const seq: ModuleSequence = {
          id: r.id,
          curriculumVersionId: r.curriculum_version_id,
          sourceModuleId: r.source_module_id,
          targetModuleId: r.target_module_id,
          relationType: r.relation_type,
          priority: Number(r.priority),
          isMandatory: r.is_mandatory,
          status: r.status
        };
        if (r.condition_json !== null && r.condition_json !== undefined) {
          seq.conditionJson = typeof r.condition_json === 'string' ? r.condition_json : JSON.stringify(r.condition_json);
        }
        return seq;
      }
    );

    // Outcomes mapping
    const outcomeRes = await this.pool.query(
      'SELECT * FROM public.module_learning_outcomes WHERE learning_module_id = $1 AND deleted_at IS NULL',
      [id]
    );
    module.outcomes = outcomeRes.rows.map(
      r => {
        const out: ModuleOutcomeMapping = {
          id: r.id,
          learningOutcomeId: r.learning_outcome_id,
          sequenceNo: Number(r.sequence_no),
          isPrimary: r.is_primary
        };
        return out;
      }
    );

    return module;
  }

  public async findByVersion(curriculumVersionId: string): Promise<LearningModule[]> {
    const res = await this.pool.query(
      'SELECT id FROM public.learning_modules WHERE curriculum_version_id = $1 AND deleted_at IS NULL',
      [curriculumVersionId]
    );
    const modules: LearningModule[] = [];
    for (const row of res.rows) {
      const m = await this.findById(row.id);
      if (m) modules.push(m);
    }
    return modules;
  }

  public async save(module: LearningModule): Promise<void> {
    const existing = await this.findById(module.id);
    if (existing) {
      await this.pool.query(
        `UPDATE public.learning_modules 
         SET code = $1, slug = $2, name = $3, description = $4, module_type = $5, 
             default_sequence_no = $6, estimated_study_minutes = $7, minimum_study_minutes = $8, 
             maximum_study_minutes = $9, is_required = $10, completion_policy = $11, status = $12, 
             lock_version = $13, updated_at = now() 
         WHERE id = $14`,
        [
          module.code,
          module.slug,
          module.name,
          module.description,
          module.moduleType,
          module.defaultSequenceNo,
          module.estimatedStudyMinutes,
          module.minimumStudyMinutes,
          module.maximumStudyMinutes,
          module.isRequired,
          module.completionPolicy,
          module.status,
          module.lockVersion,
          module.id
        ]
      );
    } else {
      await this.pool.query(
        `INSERT INTO public.learning_modules 
         (id, curriculum_version_id, code, slug, name, description, module_type, default_sequence_no, estimated_study_minutes, minimum_study_minutes, maximum_study_minutes, is_required, completion_policy, status, lock_version, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now(), now())`,
        [
          module.id,
          module.curriculumVersionId,
          module.code,
          module.slug,
          module.name,
          module.description,
          module.moduleType,
          module.defaultSequenceNo,
          module.estimatedStudyMinutes,
          module.minimumStudyMinutes,
          module.maximumStudyMinutes,
          module.isRequired,
          module.completionPolicy,
          module.status,
          module.lockVersion
        ]
      );
    }

    // Save module prerequisites
    await this.pool.query(
      'UPDATE public.module_prerequisites SET deleted_at = now() WHERE module_id = $1',
      [module.id]
    );
    for (const prereq of module.prerequisites) {
      await this.pool.query(
        `INSERT INTO public.module_prerequisites 
         (id, curriculum_version_id, module_id, prerequisite_module_id, prerequisite_type, minimum_completion_percentage, minimum_mastery_percentage, required_skill_revision_id, required_skill_level_id, is_mandatory, rationale, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [prereq.id, prereq.curriculumVersionId, prereq.moduleId, prereq.prerequisiteModuleId, prereq.prerequisiteType, prereq.minimumCompletionPercentage, prereq.minimumMasteryPercentage, prereq.requiredSkillRevisionId || null, prereq.requiredSkillLevelId || null, prereq.isMandatory, prereq.rationale || null, prereq.status]
      );
    }

    // Save module sequences
    await this.pool.query(
      'UPDATE public.module_sequences SET deleted_at = now() WHERE source_module_id = $1 OR target_module_id = $1',
      [module.id]
    );
    for (const seq of module.sequences) {
      await this.pool.query(
        `INSERT INTO public.module_sequences 
         (id, curriculum_version_id, source_module_id, target_module_id, relation_type, priority, is_mandatory, condition_json, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [seq.id, seq.curriculumVersionId, seq.sourceModuleId, seq.targetModuleId, seq.relationType, seq.priority, seq.isMandatory, seq.conditionJson ? JSON.parse(seq.conditionJson) : null, seq.status]
      );
    }

    // Save module outcomes mappings
    await this.pool.query(
      'UPDATE public.module_learning_outcomes SET deleted_at = now() WHERE learning_module_id = $1',
      [module.id]
    );
    for (const out of module.outcomes) {
      await this.pool.query(
        `INSERT INTO public.module_learning_outcomes (id, learning_module_id, learning_outcome_id, sequence_no, is_primary) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [out.id, module.id, out.learningOutcomeId, out.sequenceNo, out.isPrimary]
      );
    }
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE public.learning_modules SET deleted_at = now() WHERE id = $1',
      [id]
    );
  }
}
