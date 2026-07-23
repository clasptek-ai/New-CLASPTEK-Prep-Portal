import { describe, it, expect } from 'vitest';
import {
  PublishResultsHandler,
  GenerateReportHandler,
  RefreshProgressHandler,
  GetStudentResultsHandler,
} from './index';
import {
  AcademicProgressRepository,
  AcademicProgress,
  StudentResult,
  AcademicSummary,
  ProgressRecord,
} from '@clasptek/domain-results';

describe('Application Results CQRS Handlers', () => {
  const store = {
    progress: new Map<string, AcademicProgress>(),
    results: new Map<string, StudentResult[]>(),
    summaries: new Map<string, AcademicSummary>(),
    records: new Map<string, ProgressRecord[]>(),
    history: [] as any[],
    reports: [] as any[],
  };

  const mockRepo: AcademicProgressRepository = {
    findByStudentId: async (id: string) => store.progress.get(id) ?? null,
    save: async (prog: AcademicProgress) => {
      store.progress.set(prog.studentId, prog);
    },
    saveResult: async (res: StudentResult) => {
      const list = store.results.get(res.studentId) ?? [];
      list.push(res);
      store.results.set(res.studentId, list);
    },
    saveSummary: async (sum: AcademicSummary) => {
      store.summaries.set(sum.studentId, sum);
    },
    saveProgressRecord: async (rec: ProgressRecord) => {
      const list = store.records.get(rec.studentId) ?? [];
      list.push(rec);
      store.records.set(rec.studentId, list);
    },
    findResultsByStudent: async (studentId: string) => store.results.get(studentId) ?? [],
    findSummaryByStudent: async (studentId: string) => store.summaries.get(studentId) ?? null,
    findProgressRecordsByStudent: async (studentId: string) => store.records.get(studentId) ?? [],
    recordHistory: async (
      studentId: string,
      resultId: string,
      action: string,
      snapshot: Record<string, any>
    ) => {
      store.history.push({ studentId, resultId, action, snapshot });
    },
  };

  const mockReportRepo = {
    saveReport: async (rep: any) => {
      store.reports.push(rep);
    },
  };

  it('PublishResultsHandler publishes a student result and records history', async () => {
    const handler = new PublishResultsHandler(mockRepo);
    const resultId = await handler.execute({
      studentId: 'student-99',
      resultType: 'PRACTICE',
      sourceId: 'practice-001',
      title: 'Listening Practice 1',
      score: 80,
      maxScore: 100,
    });

    expect(resultId).toBeDefined();
    expect(store.history).toHaveLength(1);
    expect(store.history[0].action).toBe('PUBLISHED');
  });

  it('GetStudentResultsHandler queries results for a student', async () => {
    const handler = new GetStudentResultsHandler(mockRepo);
    const results = await handler.execute({ studentId: 'student-99' });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Listening Practice 1');
  });

  it('RefreshProgressHandler calculates overall academic progress', async () => {
    const handler = new RefreshProgressHandler(mockRepo);
    await handler.execute({ studentId: 'student-99' });

    const summary = store.summaries.get('student-99');
    expect(summary).toBeDefined();
    expect(summary?.overallScore).toBe(80);
    expect(summary?.totalPractices).toBe(1);
  });

  it('GenerateReportHandler generates downloadable report object', async () => {
    const handler = new GenerateReportHandler(mockRepo, mockReportRepo);
    const report = await handler.execute({
      studentId: 'student-99',
      reportType: 'PRACTICE_SUMMARY',
    });

    expect(report.reportId).toBeDefined();
    expect(report.content.resultsCount).toBe(1);
    expect(store.reports).toHaveLength(1);
  });
});
