import {
  AcademicProgressRepository,
  AcademicSummary,
  AcademicStatus,
  PerformanceTrend,
  AcademicProgress,
} from '@clasptek/domain-results';
import { randomUUID } from 'crypto';

export interface RefreshProgressCommand {
  studentId: string;
}

export class RefreshProgressHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(cmd: RefreshProgressCommand): Promise<void> {
    if (!cmd.studentId) throw new Error('studentId is required');

    const results = await this.resultsRepo.findResultsByStudent(cmd.studentId);
    let progress = await this.resultsRepo.findByStudentId(cmd.studentId);

    if (!progress) {
      progress = AcademicProgress.create(cmd.studentId);
    }

    let totalAssessments = 0;
    let totalPractices = 0;
    let totalMocks = 0;
    let totalEvaluations = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    for (const r of results) {
      if (r.resultType.type === 'ASSESSMENT') totalAssessments++;
      if (r.resultType.type === 'PRACTICE') totalPractices++;
      if (r.resultType.type === 'MOCK') totalMocks++;
      if (r.resultType.isEvaluation) totalEvaluations++;

      if (r.score) {
        scoreSum += r.score.percentage;
        scoreCount++;
      }
    }

    const overallScore = scoreCount === 0 ? 0 : Math.round((scoreSum / scoreCount) * 100) / 100;

    let statusValue: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'EXCELLING' = 'ON_TRACK';
    if (overallScore >= 85) statusValue = 'EXCELLING';
    else if (overallScore < 60) statusValue = 'AT_RISK';
    else if (overallScore < 70) statusValue = 'NEEDS_ATTENTION';

    const trendValue: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE' = 'STABLE';

    const summary = new AcademicSummary({
      id: randomUUID(),
      studentId: cmd.studentId,
      overallScore,
      academicStatus: new AcademicStatus(statusValue),
      performanceTrend: new PerformanceTrend(trendValue),
      totalAssessments,
      totalPractices,
      totalMocks,
      totalEvaluations,
      lastCalculatedAt: new Date(),
    });

    progress.updateSummary(summary);

    await this.resultsRepo.save(progress);
    await this.resultsRepo.saveSummary(summary);
  }
}
