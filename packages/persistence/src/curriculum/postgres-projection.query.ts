import { Pool } from 'pg';
import {
  CurriculumSummaryProjection,
  CurriculumCoverageProjection,
  CurriculumPublicationReadinessProjection,
  CurriculumGraphProjection,
  LessonTreeProjection
} from '@clasptek/application-curriculum';
import { DatabasePool } from '../database-pool';

export class PostgresProjectionQuery {
  constructor(private readonly dbPool: DatabasePool) {}

  private get pool(): Pool {
    return this.dbPool.getPool();
  }

  public async getSummary(curriculumId: string): Promise<CurriculumSummaryProjection | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_read.curriculum_summary_projection WHERE curriculum_id = $1',
      [curriculumId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      curriculumId: r.curriculum_id,
      code: r.code,
      name: r.name,
      description: r.description || '',
      status: r.status,
      currentVersionNo: r.current_version_no || undefined,
      totalModules: Number(r.total_modules),
      totalLessons: Number(r.total_lessons),
      updatedAt: r.updated_at
    };
  }

  public async getCoverage(versionId: string): Promise<CurriculumCoverageProjection | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_read.curriculum_coverage_projection WHERE curriculum_version_id = $1',
      [versionId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      curriculumVersionId: r.curriculum_version_id,
      totalOutcomesMapped: Number(r.total_outcomes_mapped),
      outcomesCoveredCount: Number(r.outcomes_covered_count),
      skillsFrameworkCoveragePercentage: Number(r.skills_framework_coverage_percentage),
      examWeightAlignmentScore: Number(r.exam_weight_alignment_score),
      isFullyAligned: r.is_fully_aligned
    };
  }

  public async getReadiness(versionId: string): Promise<CurriculumPublicationReadinessProjection | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_read.curriculum_publication_readiness_projection WHERE curriculum_version_id = $1',
      [versionId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      curriculumVersionId: r.curriculum_version_id,
      validationStatus: r.validation_status,
      blockingErrors: r.blocking_errors || [],
      circularReferencesCount: Number(r.circular_references_count),
      missingTranslationsLanguages: r.missing_translations_languages || [],
      dependencyLocksFrozen: r.dependency_locks_frozen
    };
  }

  public async getGraph(versionId: string): Promise<CurriculumGraphProjection | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_read.curriculum_graph_projection WHERE curriculum_version_id = $1',
      [versionId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      curriculumVersionId: r.curriculum_version_id,
      nodesJson: JSON.stringify(r.nodes),
      edgesJson: JSON.stringify(r.edges),
      longestSequencePathLength: Number(r.longest_sequence_path_length)
    };
  }

  public async getTree(versionId: string): Promise<LessonTreeProjection | null> {
    const res = await this.pool.query(
      'SELECT * FROM curriculum_read.lesson_tree_projection WHERE curriculum_version_id = $1',
      [versionId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      curriculumVersionId: r.curriculum_version_id,
      treeJson: JSON.stringify(r.tree)
    };
  }

  public async rebuildProjections(): Promise<void> {
    // For standard database views, rebuild is a no-op as the DB handles it dynamically.
    // If we transition to materialized views, refresh materialized view statements can be run here.
    return Promise.resolve();
  }
}
