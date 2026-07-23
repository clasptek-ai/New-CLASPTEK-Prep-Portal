import {
  AcademicProgressRepository,
  StudentResult,
  ResultsSearchFilters,
} from '@clasptek/domain-results';

export interface GetStudentResultsQuery extends ResultsSearchFilters {
  studentId: string;
}

export class GetStudentResultsHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(query: GetStudentResultsQuery): Promise<StudentResult[]> {
    if (!query.studentId) throw new Error('studentId is required');
    return this.resultsRepo.findResultsByStudent(query.studentId, query);
  }
}
