import {
  AcademicProgressRepository,
  AcademicSummary,
  ProgressRecord,
} from '@clasptek/domain-results';

export interface GetProgressQuery {
  studentId: string;
}

export interface ProgressSummaryView {
  summary: AcademicSummary | null;
  records: ProgressRecord[];
}

export class GetProgressHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(query: GetProgressQuery): Promise<ProgressSummaryView> {
    if (!query.studentId) throw new Error('studentId is required');

    const summary = await this.resultsRepo.findSummaryByStudent(query.studentId);
    const records = await this.resultsRepo.findProgressRecordsByStudent(query.studentId);

    return { summary, records };
  }
}
