import { AcademicProgressRepository, StudentResult } from '@clasptek/domain-results';
import { randomUUID } from 'crypto';

export type ReportTypeEnum =
  | 'STUDENT_PROGRESS'
  | 'ASSESSMENT_SUMMARY'
  | 'PRACTICE_SUMMARY'
  | 'MOCK_SUMMARY'
  | 'AI_SUMMARY'
  | 'TRANSCRIPT';

export interface GenerateReportCommand {
  studentId: string;
  reportType: ReportTypeEnum;
  title?: string;
  format?: 'JSON' | 'PDF' | 'CSV' | 'HTML';
}

export interface ReportStorageRepository {
  saveReport(report: {
    id: string;
    studentId: string;
    reportType: string;
    title: string;
    status: string;
    fileFormat: string;
    content: Record<string, any>;
    generatedAt: Date;
  }): Promise<void>;
}

export class GenerateReportHandler {
  constructor(
    private readonly resultsRepo: AcademicProgressRepository,
    private readonly reportStorage: ReportStorageRepository
  ) {}

  public async execute(
    cmd: GenerateReportCommand
  ): Promise<{ reportId: string; title: string; content: Record<string, any> }> {
    if (!cmd.studentId) throw new Error('studentId is required');
    if (!cmd.reportType) throw new Error('reportType is required');

    const results = await this.resultsRepo.findResultsByStudent(cmd.studentId);
    const summary = await this.resultsRepo.findSummaryByStudent(cmd.studentId);

    const reportId = randomUUID();
    const title = cmd.title ?? `${cmd.reportType.replace('_', ' ')} for ${cmd.studentId}`;
    const generatedAt = new Date();

    const content = {
      studentId: cmd.studentId,
      reportType: cmd.reportType,
      generatedAt: generatedAt.toISOString(),
      summary: summary
        ? {
            overallScore: summary.overallScore,
            status: summary.academicStatus.status,
            trend: summary.performanceTrend.trend,
            totalAssessments: summary.totalAssessments,
          }
        : null,
      resultsCount: results.length,
      recentResults: results.slice(0, 10).map((r: StudentResult) => ({
        id: r.id,
        title: r.title,
        type: r.resultType.type,
        score: r.score?.value,
        publishedAt: r.publishedAt.toISOString(),
      })),
    };

    await this.reportStorage.saveReport({
      id: reportId,
      studentId: cmd.studentId,
      reportType: cmd.reportType,
      title,
      status: 'COMPLETED',
      fileFormat: cmd.format ?? 'JSON',
      content,
      generatedAt,
    });

    return { reportId, title, content };
  }
}
