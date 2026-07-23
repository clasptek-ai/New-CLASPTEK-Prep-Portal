import { AcademicProgress } from '../aggregates/AcademicProgress';
import { StudentResult } from '../entities/StudentResult';
import { AcademicSummary } from '../entities/AcademicSummary';
import { ProgressRecord } from '../entities/ProgressRecord';

export interface ResultsSearchFilters {
  studentId?: string;
  resultType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AcademicProgressRepository {
  findByStudentId(studentId: string): Promise<AcademicProgress | null>;
  save(aggregate: AcademicProgress): Promise<void>;
  saveResult(result: StudentResult): Promise<void>;
  saveSummary(summary: AcademicSummary): Promise<void>;
  saveProgressRecord(record: ProgressRecord): Promise<void>;
  findResultsByStudent(studentId: string, filters?: ResultsSearchFilters): Promise<StudentResult[]>;
  findSummaryByStudent(studentId: string): Promise<AcademicSummary | null>;
  findProgressRecordsByStudent(studentId: string): Promise<ProgressRecord[]>;
  recordHistory(
    studentId: string,
    resultId: string,
    action: string,
    snapshot: Record<string, any>
  ): Promise<void>;
}
