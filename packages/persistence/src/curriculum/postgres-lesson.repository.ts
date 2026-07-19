import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {
  Lesson,
  LessonRepository,
  LessonPrerequisite,
  LessonSequence,
  LessonOutcomeMapping,
  LessonResourceMapping
} from '@clasptek/domain-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresCurriculumLessonRepository implements LessonRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  public async findById(id: string): Promise<Lesson | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.lessons WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const lesson = new Lesson(
      row.id,
      row.learning_module_id,
      row.code,
      row.slug || '',
      row.title || '',
      row.summary || '',
      row.lesson_type,
      Number(row.default_sequence_no),
      Number(row.estimated_study_minutes),
      Number(row.minimum_study_minutes),
      Number(row.maximum_study_minutes),
      row.instructional_method,
      row.completion_policy,
      row.is_required,
      row.status,
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at,
      row.module_id || undefined,
      row.name || undefined,
      row.description || undefined,
      row.display_order ? Number(row.display_order) : undefined
    );

    // Prerequisites
    const prereqRes = await this.pool.query(
      'SELECT * FROM public.lesson_prerequisites WHERE lesson_id = $1 AND deleted_at IS NULL',
      [id]
    );
    lesson.prerequisites = prereqRes.rows.map(
      r => new LessonPrerequisite(r.id, r.lesson_id, r.prerequisite_lesson_id, r.prerequisite_type, Number(r.minimum_completion_percentage), Number(r.minimum_mastery_percentage), r.required_skill_revision_id, r.required_skill_level_id, r.is_mandatory, r.rationale, r.status)
    );

    // Sequences
    const seqRes = await this.pool.query(
      'SELECT * FROM public.lesson_sequences WHERE (source_lesson_id = $1 OR target_lesson_id = $1) AND deleted_at IS NULL',
      [id]
    );
    lesson.sequences = seqRes.rows.map(
      r => {
        const seq: LessonSequence = {
          id: r.id,
          learningModuleId: r.learning_module_id,
          sourceLessonId: r.source_lesson_id,
          targetLessonId: r.target_lesson_id,
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

    // Outcomes
    const outcomeRes = await this.pool.query(
      'SELECT * FROM public.lesson_learning_outcomes WHERE lesson_id = $1 AND deleted_at IS NULL',
      [id]
    );
    lesson.outcomes = outcomeRes.rows.map(
      r => {
        const out: LessonOutcomeMapping = {
          id: r.id,
          learningOutcomeId: r.learning_outcome_id,
          sequenceNo: Number(r.sequence_no),
          isPrimary: r.is_primary
        };
        return out;
      }
    );

    // Resources
    const resRes = await this.pool.query(
      'SELECT * FROM public.lesson_resources WHERE lesson_id = $1 AND deleted_at IS NULL',
      [id]
    );
    lesson.resources = resRes.rows.map(
      r => {
        const res: LessonResourceMapping = {
          id: r.id,
          resourceReferenceId: r.resource_reference_id,
          usageType: r.usage_type,
          sequenceNo: Number(r.sequence_no),
          isRequired: r.is_required,
          availabilityPolicy: r.availability_policy
        };
        return res;
      }
    );

    return lesson;
  }

  public async findByModule(learningModuleId: string): Promise<Lesson[]> {
    const res = await this.pool.query(
      'SELECT id FROM public.lessons WHERE learning_module_id = $1 AND deleted_at IS NULL',
      [learningModuleId]
    );
    const lessons: Lesson[] = [];
    for (const row of res.rows) {
      const l = await this.findById(row.id);
      if (l) lessons.push(l);
    }
    return lessons;
  }

  public async save(lesson: Lesson): Promise<void> {
    const existing = await this.findById(lesson.id);
    if (existing) {
      await this.pool.query(
        `UPDATE public.lessons 
         SET code = $1, slug = $2, title = $3, summary = $4, lesson_type = $5, 
             default_sequence_no = $6, estimated_study_minutes = $7, minimum_study_minutes = $8, 
             maximum_study_minutes = $9, instructional_method = $10, completion_policy = $11, 
             is_required = $12, status = $13, lock_version = $14, updated_at = now() 
         WHERE id = $15`,
        [
          lesson.code,
          lesson.slug,
          lesson.title,
          lesson.summary,
          lesson.lessonType,
          lesson.defaultSequenceNo,
          lesson.estimatedStudyMinutes,
          lesson.minimumStudyMinutes,
          lesson.maximumStudyMinutes,
          lesson.instructionalMethod,
          lesson.completionPolicy,
          lesson.isRequired,
          lesson.status,
          lesson.lockVersion,
          lesson.id
        ]
      );
    } else {
      await this.pool.query(
        `INSERT INTO public.lessons 
         (id, learning_module_id, code, slug, title, summary, lesson_type, default_sequence_no, estimated_study_minutes, minimum_study_minutes, maximum_study_minutes, instructional_method, completion_policy, is_required, status, lock_version, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now(), now())`,
        [
          lesson.id,
          lesson.learningModuleId,
          lesson.code,
          lesson.slug,
          lesson.title,
          lesson.summary,
          lesson.lessonType,
          lesson.defaultSequenceNo,
          lesson.estimatedStudyMinutes,
          lesson.minimumStudyMinutes,
          lesson.maximumStudyMinutes,
          lesson.instructionalMethod,
          lesson.completionPolicy,
          lesson.isRequired,
          lesson.status,
          lesson.lockVersion
        ]
      );
    }

    // Save lesson prerequisites
    await this.pool.query(
      'UPDATE public.lesson_prerequisites SET deleted_at = now() WHERE lesson_id = $1',
      [lesson.id]
    );
    for (const prereq of lesson.prerequisites) {
      await this.pool.query(
        `INSERT INTO public.lesson_prerequisites 
         (id, lesson_id, prerequisite_lesson_id, prerequisite_type, minimum_completion_percentage, minimum_mastery_percentage, required_skill_revision_id, required_skill_level_id, is_mandatory, rationale, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [prereq.id, prereq.lessonId, prereq.prerequisiteLessonId, prereq.prerequisiteType, prereq.minimumCompletionPercentage, prereq.minimumMasteryPercentage, prereq.requiredSkillRevisionId || null, prereq.requiredSkillLevelId || null, prereq.isMandatory, prereq.rationale || null, prereq.status]
      );
    }

    // Save lesson sequences
    await this.pool.query(
      'UPDATE public.lesson_sequences SET deleted_at = now() WHERE source_lesson_id = $1 OR target_lesson_id = $1',
      [lesson.id]
    );
    for (const seq of lesson.sequences) {
      await this.pool.query(
        `INSERT INTO public.lesson_sequences 
         (id, learning_module_id, source_lesson_id, target_lesson_id, relation_type, priority, is_mandatory, condition_json, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [seq.id, seq.learningModuleId, seq.sourceLessonId, seq.targetLessonId, seq.relationType, seq.priority, seq.isMandatory, seq.conditionJson ? JSON.parse(seq.conditionJson) : null, seq.status]
      );
    }

    // Save lesson outcomes
    await this.pool.query(
      'UPDATE public.lesson_learning_outcomes SET deleted_at = now() WHERE lesson_id = $1',
      [lesson.id]
    );
    for (const out of lesson.outcomes) {
      await this.pool.query(
        `INSERT INTO public.lesson_learning_outcomes (id, lesson_id, learning_outcome_id, sequence_no, is_primary) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [out.id, lesson.id, out.learningOutcomeId, out.sequenceNo, out.isPrimary]
      );
    }

    // Save lesson resources
    await this.pool.query(
      'UPDATE public.lesson_resources SET deleted_at = now() WHERE lesson_id = $1',
      [lesson.id]
    );
    for (const r of lesson.resources) {
      await this.pool.query(
        `INSERT INTO public.lesson_resources (id, lesson_id, resource_reference_id, usage_type, sequence_no, is_required, availability_policy) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET deleted_at = null`,
        [r.id, lesson.id, r.resourceReferenceId, r.usageType, r.sequenceNo, r.isRequired, r.availabilityPolicy]
      );
    }
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE public.lessons SET deleted_at = now() WHERE id = $1',
      [id]
    );
  }
}
