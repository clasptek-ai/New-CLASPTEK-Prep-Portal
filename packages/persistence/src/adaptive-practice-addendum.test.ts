import { describe, test, expect, vi } from 'vitest';
import {
  PostgresPracticeGoalRepository,
  PostgresRetentionRepository,
  PostgresDailyGoalRepository,
  PostgresMotivationRepository,
  PostgresPracticeAnalyticsRepository,
} from './index';
import {
  StudentPracticeGoal,
  RetentionProfile,
  StudentDailyGoal,
  StudentMotivation,
} from '@clasptek/domain-adaptive-practice';

// Mock DB Pool
function mkMockDbPool() {
  const query = vi.fn(async (sql: string, _params?: any[]) => {
    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
      return { rows: [] };
    }
    if (sql.includes('practice_goals')) {
      return {
        rows: [
          {
            id: 'goal-1',
            student_id: 's-1',
            journey_id: null,
            goal_type: 'IMPROVE_GRAMMAR_ACCURACY',
            goal_title: 'Improve Grammar Accuracy',
            goal_description: null,
            target_value: '85.00',
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('retention_profiles')) {
      return {
        rows: [
          {
            id: 'rp-1',
            student_id: 's-1',
            competency_id: 'grammar',
            last_reviewed: new Date(),
            retention_score: '85.00',
            review_interval: 24,
            next_review_date: new Date(),
            review_priority: 'MEDIUM',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('daily_goals')) {
      return {
        rows: [
          {
            id: 'dg-1',
            student_id: 's-1',
            target_date: '2026-07-20',
            target_questions: 15,
            target_passages: 2,
            timed_practice_required: false,
            vocabulary_review_required: false,
            completed_questions: 5,
            status: 'IN_PROGRESS',
          },
        ],
      };
    }
    if (sql.includes('practice_motivation')) {
      return {
        rows: [
          {
            id: 'pm-1',
            student_id: 's-1',
            daily_streak: 3,
            weekly_streak: 1,
            longest_streak: 5,
            practice_points: 120,
            xp: 350,
            badges: ['7-Day Streak'],
            achievements: [],
            milestones: [],
          },
        ],
      };
    }
    if (sql.includes('practice_analytics_projections')) {
      return {
        rows: [
          {
            id: 'pap-1',
            student_id: 's-1',
            accuracy_trend: [80, 85, 90],
            speed_trend: [],
            mastery_trend: [],
            retention_trend: [],
            weak_skills: ['Grammar'],
            strong_skills: ['Reading'],
            practice_frequency: '4.50',
            consistency_score: '88.00',
            total_study_time_ms: 1200000,
            total_questions_answered: 45,
            hints_used: 2,
            skipped_questions: 1,
            bookmark_rate: '10.00',
          },
        ],
      };
    }
    return { rows: [] };
  });

  const client = { query, release: vi.fn() };
  return {
    getPool: () => ({ query, connect: vi.fn().mockResolvedValue(client) }),
    query,
  };
}

describe('Adaptive Practice Addendum Repositories Unit Tests', () => {
  const dbPool = mkMockDbPool() as any;

  test('PostgresPracticeGoalRepository saves and retrieves goals', async () => {
    const repo = new PostgresPracticeGoalRepository(dbPool);
    const goal = StudentPracticeGoal.create(
      'goal-1',
      's-1',
      'IMPROVE_GRAMMAR_ACCURACY',
      'Title',
      85
    );
    await repo.save(goal);

    const retrieved = await repo.findActive('s-1');
    expect(retrieved?.goalType).toBe('IMPROVE_GRAMMAR_ACCURACY');
    expect(retrieved?.targetValue).toBe(85);
  });

  test('PostgresRetentionRepository saves and retrieves retention profile', async () => {
    const repo = new PostgresRetentionRepository(dbPool);
    const profile = new RetentionProfile({ id: 'rp-1', studentId: 's-1', competencyId: 'grammar' });
    await repo.save(profile);

    const retrieved = await repo.findByStudentAndCompetency('s-1', 'grammar');
    expect(retrieved?.retentionScore).toBe(85);
    expect(retrieved?.reviewPriority).toBe('MEDIUM');
  });

  test('PostgresDailyGoalRepository saves and retrieves daily goal', async () => {
    const repo = new PostgresDailyGoalRepository(dbPool);
    const goal = new StudentDailyGoal({
      id: 'dg-1',
      studentId: 's-1',
      targetDate: '2026-07-20',
      targetQuestions: 15,
      targetPassages: 2,
      timedPracticeRequired: false,
      vocabularyReviewRequired: false,
    });
    await repo.save(goal);

    const retrieved = await repo.findByStudentAndDate('s-1', '2026-07-20');
    expect(retrieved?.targetQuestions).toBe(15);
    expect(retrieved?.status).toBe('IN_PROGRESS');
  });

  test('PostgresMotivationRepository saves and retrieves motivation data', async () => {
    const repo = new PostgresMotivationRepository(dbPool);
    const motivation = new StudentMotivation({ id: 'pm-1', studentId: 's-1' });
    await repo.save(motivation);

    const retrieved = await repo.findByStudent('s-1');
    expect(retrieved?.dailyStreak).toBe(3);
    expect(retrieved?.xp).toBe(350);
  });

  test('PostgresPracticeAnalyticsRepository saves and retrieves projections', async () => {
    const repo = new PostgresPracticeAnalyticsRepository(dbPool);
    await repo.saveProjection('s-1', { accuracyTrend: [80, 85, 90], hintsUsed: 2 });

    const retrieved = await repo.getProjection('s-1');
    expect(retrieved?.hints_used).toBe(2);
  });
});
