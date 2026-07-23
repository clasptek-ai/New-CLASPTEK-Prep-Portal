import {
  AcademicProgressRepository,
  AcademicProgress,
  StudentResult,
  AcademicSummary,
  ProgressRecord,
  ResultsSearchFilters,
  ResultType,
  ProgressScore,
  AcademicStatus,
  PerformanceTrend,
} from '@clasptek/domain-results';
import { ReportStorageRepository, ReportQueryRepository } from '@clasptek/application-results';
import { Pool } from 'pg';

export class PostgresAcademicProgressRepository implements AcademicProgressRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | any) {
    this.pool = poolOrDbPool?.pool ?? poolOrDbPool;
  }

  public async findByStudentId(studentId: string): Promise<AcademicProgress | null> {
    const summaryRes = await this.pool.query(
      `SELECT * FROM student_progress WHERE student_id = $1`,
      [studentId]
    );

    const summary = summaryRes.rows.length > 0 ? this.mapSummaryRow(summaryRes.rows[0]) : undefined;
    const results = await this.findResultsByStudent(studentId);
    const records = await this.findProgressRecordsByStudent(studentId);

    if (!summary && results.length === 0 && records.length === 0) {
      return null;
    }

    return new AcademicProgress({
      id: summary?.id ?? studentId,
      studentId,
      ...(summary ? { summary } : {}),
      results,
      records,
    });
  }

  public async save(aggregate: AcademicProgress): Promise<void> {
    if (aggregate.summary) {
      await this.saveSummary(aggregate.summary);
    }
  }

  public async saveResult(result: StudentResult): Promise<void> {
    await this.pool.query(
      `INSERT INTO student_results (
        id, student_id, result_type, source_id, title, score, max_score, band_score, percentage, is_passing, summary_feedback, details, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (student_id, result_type, source_id) DO UPDATE SET
        title = EXCLUDED.title,
        score = EXCLUDED.score,
        max_score = EXCLUDED.max_score,
        band_score = EXCLUDED.band_score,
        percentage = EXCLUDED.percentage,
        is_passing = EXCLUDED.is_passing,
        summary_feedback = EXCLUDED.summary_feedback,
        details = EXCLUDED.details,
        updated_at = NOW()`,
      [
        result.id,
        result.studentId,
        result.resultType.type,
        result.sourceId,
        result.title,
        result.score?.value ?? null,
        result.score?.maxScore ?? null,
        result.bandScore ?? null,
        result.score?.percentage ?? null,
        result.isPassing ?? null,
        result.summaryFeedback ?? null,
        JSON.stringify(result.details),
        result.publishedAt,
      ]
    );
  }

  public async saveSummary(summary: AcademicSummary): Promise<void> {
    await this.pool.query(
      `INSERT INTO student_progress (
        id, student_id, overall_score, academic_status, performance_trend, total_assessments, total_practices, total_mocks, total_evaluations, average_band_score, strongest_skills, weakest_skills, last_calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (student_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        academic_status = EXCLUDED.academic_status,
        performance_trend = EXCLUDED.performance_trend,
        total_assessments = EXCLUDED.total_assessments,
        total_practices = EXCLUDED.total_practices,
        total_mocks = EXCLUDED.total_mocks,
        total_evaluations = EXCLUDED.total_evaluations,
        average_band_score = EXCLUDED.average_band_score,
        strongest_skills = EXCLUDED.strongest_skills,
        weakest_skills = EXCLUDED.weakest_skills,
        last_calculated_at = EXCLUDED.last_calculated_at,
        updated_at = NOW()`,
      [
        summary.id,
        summary.studentId,
        summary.overallScore,
        summary.academicStatus.status,
        summary.performanceTrend.trend,
        summary.totalAssessments,
        summary.totalPractices,
        summary.totalMocks,
        summary.totalEvaluations,
        summary.averageBandScore ?? null,
        JSON.stringify(summary.strongestSkills),
        JSON.stringify(summary.weakestSkills),
        summary.lastCalculatedAt,
      ]
    );
  }

  public async saveProgressRecord(record: ProgressRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO performance_statistics (
        id, student_id, skill_code, latest_score, best_score, average_score, attempt_count, improvement_rate, last_activity_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (student_id, skill_code) DO UPDATE SET
        latest_score = EXCLUDED.latest_score,
        best_score = EXCLUDED.best_score,
        average_score = EXCLUDED.average_score,
        attempt_count = EXCLUDED.attempt_count,
        improvement_rate = EXCLUDED.improvement_rate,
        last_activity_at = EXCLUDED.last_activity_at,
        updated_at = NOW()`,
      [
        record.id,
        record.studentId,
        record.skillCode,
        record.latestScore ?? null,
        record.bestScore ?? null,
        record.averageScore ?? null,
        record.attemptCount,
        record.improvementRate,
        record.lastActivityAt,
      ]
    );
  }

  public async findResultsByStudent(
    studentId: string,
    filters?: ResultsSearchFilters
  ): Promise<StudentResult[]> {
    let query = `SELECT * FROM student_results WHERE student_id = $1`;
    const params: any[] = [studentId];

    if (filters?.resultType) {
      params.push(filters.resultType);
      query += ` AND result_type = $${params.length}`;
    }

    query += ` ORDER BY published_at DESC`;

    if (filters?.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => this.mapResultRow(r));
  }

  public async findSummaryByStudent(studentId: string): Promise<AcademicSummary | null> {
    const res = await this.pool.query(`SELECT * FROM student_progress WHERE student_id = $1`, [
      studentId,
    ]);
    if (res.rows.length === 0) return null;
    return this.mapSummaryRow(res.rows[0]);
  }

  public async findProgressRecordsByStudent(studentId: string): Promise<ProgressRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM performance_statistics WHERE student_id = $1`,
      [studentId]
    );
    return res.rows.map(
      (r) =>
        new ProgressRecord({
          id: r.id,
          studentId: r.student_id,
          skillCode: r.skill_code,
          ...(r.latest_score !== null ? { latestScore: Number(r.latest_score) } : {}),
          ...(r.best_score !== null ? { bestScore: Number(r.best_score) } : {}),
          ...(r.average_score !== null ? { averageScore: Number(r.average_score) } : {}),
          attemptCount: r.attempt_count,
          improvementRate: Number(r.improvement_rate),
          lastActivityAt: new Date(r.last_activity_at),
        })
    );
  }

  public async recordHistory(
    studentId: string,
    resultId: string,
    action: string,
    snapshot: Record<string, any>
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO result_history (student_id, result_id, action, snapshot) VALUES ($1, $2, $3, $4)`,
      [studentId, resultId, action, JSON.stringify(snapshot)]
    );
  }

  private mapResultRow(r: any): StudentResult {
    return new StudentResult({
      id: r.id,
      studentId: r.student_id,
      resultType: new ResultType(r.result_type),
      sourceId: r.source_id,
      title: r.title,
      ...(r.score !== null
        ? { score: new ProgressScore(Number(r.score), Number(r.max_score ?? 100)) }
        : {}),
      ...(r.band_score !== null ? { bandScore: r.band_score } : {}),
      ...(r.is_passing !== null ? { isPassing: r.is_passing } : {}),
      ...(r.summary_feedback !== null ? { summaryFeedback: r.summary_feedback } : {}),
      details: typeof r.details === 'string' ? JSON.parse(r.details) : (r.details ?? {}),
      publishedAt: new Date(r.published_at),
    });
  }

  private mapSummaryRow(r: any): AcademicSummary {
    return new AcademicSummary({
      id: r.id,
      studentId: r.student_id,
      overallScore: Number(r.overall_score),
      academicStatus: new AcademicStatus(r.academic_status),
      performanceTrend: new PerformanceTrend(r.performance_trend),
      totalAssessments: r.total_assessments,
      totalPractices: r.total_practices,
      totalMocks: r.total_mocks,
      totalEvaluations: r.total_evaluations,
      ...(r.average_band_score !== null ? { averageBandScore: r.average_band_score } : {}),
      strongestSkills:
        typeof r.strongest_skills === 'string'
          ? JSON.parse(r.strongest_skills)
          : (r.strongest_skills ?? []),
      weakestSkills:
        typeof r.weakest_skills === 'string'
          ? JSON.parse(r.weakest_skills)
          : (r.weakest_skills ?? []),
      lastCalculatedAt: new Date(r.last_calculated_at),
    });
  }
}

export class PostgresDownloadableReportRepository
  implements ReportStorageRepository, ReportQueryRepository
{
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | any) {
    this.pool = poolOrDbPool?.pool ?? poolOrDbPool;
  }

  public async saveReport(report: {
    id: string;
    studentId: string;
    reportType: string;
    title: string;
    status: string;
    fileFormat: string;
    content: Record<string, any>;
    generatedAt: Date;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO downloadable_reports (
        id, student_id, report_type, title, status, file_format, content, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        report.id,
        report.studentId,
        report.reportType,
        report.title,
        report.status,
        report.fileFormat,
        JSON.stringify(report.content),
        report.generatedAt,
      ]
    );
  }

  public async findReportById(reportId: string, studentId: string) {
    const res = await this.pool.query(
      `SELECT * FROM downloadable_reports WHERE id = $1 AND student_id = $2`,
      [reportId, studentId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      studentId: r.student_id,
      reportType: r.report_type,
      title: r.title,
      status: r.status,
      fileFormat: r.file_format,
      content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
      generatedAt: new Date(r.generated_at),
    };
  }
}
