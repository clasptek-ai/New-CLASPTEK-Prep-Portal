import { AcademicProgressRepository, StudentResult } from '@clasptek/domain-results';

export interface GetPerformanceHistoryQuery {
  studentId: string;
  limit?: number;
}

export class GetPerformanceHistoryHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(query: GetPerformanceHistoryQuery): Promise<StudentResult[]> {
    if (!query.studentId) throw new Error('studentId is required');
    const limit = query.limit ?? 50;
    return this.resultsRepo.findResultsByStudent(query.studentId, { limit });
  }
}
