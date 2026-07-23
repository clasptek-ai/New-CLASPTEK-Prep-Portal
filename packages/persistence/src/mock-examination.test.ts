import { describe, test, expect, vi } from 'vitest';
import {
  PostgresMockTemplateRepository,
  PostgresMockSessionRepository,
  PostgresMockResultRepository,
} from './index';
import { MockTemplate, MockSession, MockResult } from '@clasptek/domain-mock-examination';

function mkMockDbPool() {
  const query = vi.fn(async (sql: string, _params?: any[]) => {
    if (sql.includes('mock_templates')) {
      return {
        rows: [
          {
            id: 'temp-1',
            blueprint_id: 'bp-1',
            version: 1,
            total_duration_minutes: 90,
            passing_score: '70.00',
            scoring_strategy: 'IELTS',
            status: 'PUBLISHED',
          },
        ],
      };
    }
    if (sql.includes('mock_sessions')) {
      return {
        rows: [
          {
            id: 'sess-1',
            student_id: 'stud-1',
            template_id: 'temp-1',
            version: 1,
            status: 'IN_PROGRESS',
            current_section_index: 0,
            time_remaining_seconds: 5400,
            started_at: new Date(),
            submitted_at: null,
          },
        ],
      };
    }
    if (sql.includes('mock_attempts')) {
      return {
        rows: [
          {
            id: 'att-1',
            session_id: 'sess-1',
            student_id: 'stud-1',
            answers_count: 5,
            flagged_questions: [],
          },
        ],
      };
    }
    if (sql.includes('mock_results')) {
      return {
        rows: [
          {
            id: 'res-1',
            session_id: 'sess-1',
            student_id: 'stud-1',
            overall_raw_score: '85.00',
            official_scaled_score: '7.50',
            official_score_label: 'IELTS Band 7.5',
            percentile: '92.00',
            status: 'SCORED',
          },
        ],
      };
    }
    if (sql.includes('mock_reports')) {
      return {
        rows: [
          {
            id: 'rep-1',
            result_id: 'res-1',
            student_id: 'stud-1',
            weak_areas: ['Grammar'],
            strong_areas: ['Inference'],
            study_recommendations: ['Practice 3 sessions'],
          },
        ],
      };
    }
    if (sql.includes('mock_readiness')) {
      return {
        rows: [
          {
            id: 'read-1',
            student_id: 'stud-1',
            result_id: 'res-1',
            overall_readiness_pct: '88.00',
            pass_probability_pct: '85.00',
            recommended_study_hours: 10,
          },
        ],
      };
    }
    return { rows: [] };
  });

  return {
    getPool: () => ({ query }),
  } as any;
}

describe('Mock Examination Persistence Repositories Unit Tests', () => {
  test('PostgresMockTemplateRepository save and findById', async () => {
    const dbPool = mkMockDbPool();
    const repo = new PostgresMockTemplateRepository(dbPool);
    const t = new MockTemplate({
      id: 'temp-1',
      blueprintId: 'bp-1',
      version: 1,
      totalDurationMinutes: 90,
      passingScore: 70,
      scoringStrategy: 'IELTS',
      sections: [],
    });

    await repo.save(t);
    const found = await repo.findById('temp-1');
    expect(found?.scoringStrategy).toBe('IELTS');
  });

  test('PostgresMockSessionRepository save and findActive', async () => {
    const dbPool = mkMockDbPool();
    const repo = new PostgresMockSessionRepository(dbPool);
    const s = new MockSession({ id: 'sess-1', studentId: 'stud-1', templateId: 'temp-1' });

    await repo.save(s);
    const active = await repo.findActive('stud-1');
    expect(active?.id).toBe('sess-1');
  });

  test('PostgresMockResultRepository save and findBySession', async () => {
    const dbPool = mkMockDbPool();
    const repo = new PostgresMockResultRepository(dbPool);
    const r = new MockResult({
      id: 'res-1',
      sessionId: 'sess-1',
      studentId: 'stud-1',
      overallRawScore: 85,
      officialScaledScore: 7.5,
      officialScoreLabel: 'IELTS Band 7.5',
      percentile: 92,
      sectionScores: [],
    });

    await repo.save(r);
    const found = await repo.findBySession('sess-1');
    expect(found?.officialScoreLabel).toBe('IELTS Band 7.5');
  });
});
