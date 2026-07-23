import { describe, test, expect } from 'vitest';
import { BulkImportEngine, AdminAcademicService } from './index';

describe('Admin Academic Service & Bulk Import Engine (Sprint 3.2)', () => {
  test('BulkImportEngine correctly parses valid JSON questions and detects duplicates', () => {
    const engine = new BulkImportEngine();
    const rawJson = JSON.stringify([
      { code: 'Q-101', questionText: 'What is a noun?', skill: 'Grammar', difficulty: 'EASY' },
      {
        code: 'Q-101',
        questionText: 'Duplicate question text',
        skill: 'Grammar',
        difficulty: 'EASY',
      },
      { code: 'Q-102', questionText: 'What is a verb?', skill: 'Grammar', difficulty: 'MEDIUM' },
    ]);

    const report = engine.parseAndValidate('json', rawJson);

    expect(report.totalRecords).toBe(3);
    expect(report.validCount).toBe(2);
    expect(report.duplicateCount).toBe(1);
    expect(report.invalidCount).toBe(1);
  });

  test('AdminAcademicService returns KPI metrics', async () => {
    const service = new AdminAcademicService();
    const kpis = await service.getDashboardKPIs();

    expect(kpis.totalStudents).toBeGreaterThan(0);
    expect(kpis.assessmentsCompleted).toBeGreaterThan(0);
  });

  test('AdminAcademicService unlocks practice mode cleanly', async () => {
    const service = new AdminAcademicService();
    const res = await service.unlockPractice('s-101', 'DIAGNOSTIC_RESULTS');

    expect(res.success).toBe(true);
    expect(res.newStage).toBe('PRACTICE_UNLOCKED');
  });

  test('AdminAcademicService unlocks mock mode cleanly', async () => {
    const service = new AdminAcademicService();
    const res = await service.unlockMock('s-101', 'PRACTICE_COMPLETED');

    expect(res.success).toBe(true);
    expect(res.newStage).toBe('MOCK_UNLOCKED');
  });
});
