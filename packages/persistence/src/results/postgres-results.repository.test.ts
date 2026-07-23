import { describe, it, expect, vi } from 'vitest';
import {
  PostgresAcademicProgressRepository,
  PostgresDownloadableReportRepository,
} from './postgres-results.repository';
import { StudentResult, ResultType, ProgressScore } from '@clasptek/domain-results';

describe('PostgresResultsRepository', () => {
  it('saveResult executes SQL query with mapped arguments', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const poolMock = { query: queryMock } as any;

    const repo = new PostgresAcademicProgressRepository(poolMock);
    const result = new StudentResult({
      id: 'res-99',
      studentId: 'stu-99',
      resultType: new ResultType('ASSESSMENT'),
      sourceId: 'src-99',
      title: 'Math Test',
      score: new ProgressScore(95, 100),
    });

    await repo.saveResult(result);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO student_results');
    expect(queryMock.mock.calls[0][1][0]).toBe('res-99');
    expect(queryMock.mock.calls[0][1][1]).toBe('stu-99');
  });

  it('saveReport executes SQL query on downloadable_reports table', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const poolMock = { query: queryMock } as any;

    const repo = new PostgresDownloadableReportRepository(poolMock);
    await repo.saveReport({
      id: 'rep-1',
      studentId: 'stu-99',
      reportType: 'TRANSCRIPT',
      title: 'Academic Transcript',
      status: 'COMPLETED',
      fileFormat: 'JSON',
      content: { gpa: 4.0 },
      generatedAt: new Date(),
    });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO downloadable_reports');
    expect(queryMock.mock.calls[0][1][2]).toBe('TRANSCRIPT');
  });
});
