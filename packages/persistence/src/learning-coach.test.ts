import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { DatabasePool } from './index';
import {
  PostgresLearningCoachRepository,
  PostgresCoachBrainRepository,
  PostgresCoachMemoryRepository,
  PostgresGoalRepository,
  PostgresHabitRepository,
  PostgresHabitAnalyticsRepository,
  PostgresReflectionRepository,
  PostgresCoachDashboardProjectionRepository,
  PostgresMotivationProfileRepository,
  PostgresCoachingSessionRepository,
  PostgresCoachingPlanRepository,
  PostgresDailyStudyPlanRepository,
  PostgresRevisionPlanRepository,
  PostgresConversationRepository,
  PostgresInsightRepository,
  PostgresNotificationRepository
} from './index';
import {
  LearningCoach,
  CoachBrain,
  CoachMemory,
  StudyGoal,
  HabitTracker,
  HabitAnalytics,
  ReflectionJournal,
  CoachDashboardProjection,
  MotivationProfile,
  CoachingSession,
  CoachingPlan,
  DailyStudyPlan,
  StudyPlanTask,
  RevisionPlan,
  CoachConversation,
  ConversationMessage,
  CoachInsight,
  CoachNotification,
  GoalTarget,
  ReflectionEntry,
  RevisionCampaign
} from '@clasptek/domain-learning-coach';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';

let querySqls: string[] = [];
let queryParams: any[][] = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    querySqls.push(sql);
    if (params) queryParams.push(params);

    if (sql.includes('FROM learning_coaches')) {
      return {
        rows: [{
          id: 'coach-1',
          student_id: 'stud-1',
          profile_id: 'prof-1',
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM coach_brains')) {
      return {
        rows: [{
          id: 'brain-1',
          coach_id: 'coach-1',
          coaching_style_tone: 'ENCOURAGING',
          coaching_style_pacing: 'BALANCED',
          active_engine: 'RULE_BASED',
          llm_model_id: null,
          prompt_version: 'v1.0.0',
          last_active_at: null,
          created_at: new Date(),
          updated_at: new Date()
         }]
      };
    }

    if (sql.includes('FROM coach_memory')) {
      return {
        rows: [{
          id: 'mem-1',
          coach_id: 'coach-1',
          preferred_study_hours: [],
          preferred_learning_style: 'VISUAL',
          preferred_motivation_style: 'ENCOURAGEMENT',
          recurring_mistakes: [],
          strongest_subjects: [],
          weakest_competencies: [],
          recurring_questions: [],
          key_milestones: [],
          notes: 'Test note',
          version: 1,
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM study_goals')) {
      return {
        rows: [{
          id: 'goal-1',
          coach_id: 'coach-1',
          goal_type: 'DAILY',
          status: 'ACTIVE',
          title: 'Daily Goal',
          description: 'Study hard',
          target_value: '60.00',
          current_value: '30.00',
          target_unit: 'minutes',
          deadline: null,
          completed_at: null,
          failed_at: null,
          paused_at: null,
          paused_reason: null,
          risk_detected_at: null,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM habit_trackers')) {
      return {
        rows: [{
          id: 'habit-1',
          coach_id: 'coach-1',
          habit_date: '2026-07-16',
          studied: true,
          study_minutes: 45,
          session_count: 1,
          focus_score: '8.50',
          mood: 'GOOD',
          notes: 'Great day',
          created_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM habit_analytics')) {
      return {
        rows: [{
          id: 'ha-1',
          coach_id: 'coach-1',
          period_type: 'WEEKLY',
          period_start: '2026-07-13',
          period_end: '2026-07-19',
          current_streak: 5,
          longest_streak: 10,
          weekly_consistency: '85.00',
          monthly_consistency: '90.00',
          avg_session_minutes: '45.00',
          best_study_hour: 9,
          worst_study_hour: 22,
          study_velocity: '10.50',
          computed_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM reflection_journals')) {
      return {
        rows: [{
          id: 'ref-1',
          coach_id: 'coach-1',
          session_id: null,
          mood: 'POSITIVE',
          difficulty_rating: 3,
          insights: 'Gaining confidence',
          what_went_well: 'Completed reading exercise',
          what_was_difficult: 'Grammar review was hard',
          next_session_focus: 'Speaking',
          recorded_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM coach_dashboard_projections')) {
      return {
        rows: [{
          id: 'proj-1',
          coach_id: 'coach-1',
          today_tasks: [],
          goal_summary: { active: 1, completed: 0, atRisk: 0, failed: 0 },
          habit_summary: { streak: 5, consistency: 0.85, todayStudied: true },
          latest_motivation: {},
          critical_insights: [],
          prediction_summary: {},
          last_computed_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM motivation_profiles')) {
      return {
        rows: [{
          id: 'prof-1',
          coach_id: 'coach-1',
          archetype: 'GOAL_DRIVEN',
          risk_tolerance: 'MEDIUM',
          preferred_feedback: 'POSITIVE_FIRST',
          milestone_count: 3,
          last_milestone_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM coaching_sessions')) {
      return {
        rows: [{
          id: 'sess-1',
          coach_id: 'coach-1',
          session_type: 'DAILY_CHECK_IN',
          status: 'ACTIVE',
          started_at: new Date(),
          ended_at: null,
          duration_seconds: null,
          summary: null
        }]
      };
    }

    if (sql.includes('FROM coaching_plans')) {
      return {
        rows: [{
          id: 'plan-1',
          coach_id: 'coach-1',
          plan_type: 'WEEKLY',
          status: 'ACTIVE',
          snapshot_id: null,
          prediction_score: null,
          start_date: new Date(),
          end_date: new Date(),
          focus_competencies: [],
          priority_areas: [],
          generated_by_engine: 'RULE_BASED',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM daily_study_plans')) {
      return {
        rows: [{
          id: 'daily-1',
          coach_id: 'coach-1',
          coaching_plan_id: null,
          plan_date: new Date(),
          status: 'PENDING',
          total_minutes: 60,
          completed_minutes: 0,
          completion_rate: '0.00',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM study_plan_tasks')) {
      return {
        rows: [{
          id: 'task-1',
          daily_plan_id: 'daily-1',
          task_type: 'PRACTICE',
          title: 'Grammar Exercise',
          estimated_minutes: 30,
          priority: 3,
          status: 'PENDING',
          completed_at: null,
          sort_order: 0
        }]
      };
    }

    if (sql.includes('FROM revision_plans')) {
      return {
        rows: [{
          id: 'rev-1',
          coach_id: 'coach-1',
          campaign_type: 'REVISION_A',
          status: 'ACTIVE',
          start_date: new Date(),
          end_date: new Date(),
          focus_areas: [],
          exam_date: null,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM coach_conversations')) {
      return {
        rows: [{
          id: 'convo-1',
          coach_id: 'coach-1',
          session_id: null,
          topic: 'General Review',
          status: 'ACTIVE',
          message_count: 2,
          total_tokens: 50,
          started_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM conversation_messages')) {
      return {
        rows: [
          { id: 'msg-1', conversation_id: 'convo-1', role: 'STUDENT', content: 'Help', token_count: 5, metadata: {}, created_at: new Date() },
          { id: 'msg-2', conversation_id: 'convo-1', role: 'COACH', content: 'Sure', token_count: 5, metadata: {}, created_at: new Date() }
        ]
      };
    }

    if (sql.includes('FROM coach_insights')) {
      return {
        rows: [{
          id: 'ins-1',
          coach_id: 'coach-1',
          category: 'WRITING',
          severity: 'HIGH',
          confidence: '0.85',
          insight_text: 'Grammar needs work',
          created_from_prediction_id: null,
          created_from_evaluation_id: null,
          resolved: false,
          archived: false,
          resolved_at: null,
          created_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM coach_notifications')) {
      return {
        rows: [{
          id: 'notif-1',
          coach_id: 'coach-1',
          notification_type: 'STUDY_REMINDER',
          channel: 'IN_APP',
          status: 'SCHEDULED',
          title: 'Reminder',
          body: 'Time to study',
          metadata: {},
          scheduled_at: new Date(),
          delivered_at: null,
          retry_count: 0,
          max_retries: 3,
          created_at: new Date()
        }]
      };
    }

    return { rows: [] };
  });

  const PoolMock = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      release: vi.fn()
    }),
    query: queryMock,
    end: vi.fn().mockResolvedValue(undefined)
  }));

  return { Pool: PoolMock };
});

describe('Postgres Learning Coach Repositories', () => {
  let dbPool: DatabasePool;

  beforeEach(() => {
    querySqls = [];
    queryParams = [];
    const env = loadEnvironment();
    const logger = new ConsoleLogger('test');
    dbPool = new DatabasePool(env, logger);
    dbPool.connect();
  });

  test('PostgresLearningCoachRepository saves and finds coach', async () => {
    const repo = new PostgresLearningCoachRepository(dbPool);
    const coach = LearningCoach.create({ studentId: 'stud-1', profileId: 'prof-1' });

    await repo.save(coach);
    expect(querySqls.some(sql => sql.includes('INSERT INTO learning_coaches'))).toBe(true);

    const found = await repo.findById(coach.id);
    expect(found).toBeDefined();
    expect(found?.studentId).toBe('stud-1');
  });

  test('PostgresCoachBrainRepository saves and finds brain', async () => {
    const repo = new PostgresCoachBrainRepository(dbPool);
    const brain = CoachBrain.create('coach-1');

    await repo.save(brain);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_brains'))).toBe(true);

    const found = await repo.findByCoachId('coach-1');
    expect(found).toBeDefined();
    expect(found?.coachId).toBe('coach-1');
  });

  test('PostgresCoachMemoryRepository saves and finds memory', async () => {
    const repo = new PostgresCoachMemoryRepository(dbPool);
    const memory = CoachMemory.create('coach-1');

    await repo.save(memory);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_memory'))).toBe(true);

    const found = await repo.findByCoachId('coach-1');
    expect(found).toBeDefined();
    expect(found?.notes).toBe('Test note');
  });

  test('PostgresGoalRepository saves and finds goals', async () => {
    const repo = new PostgresGoalRepository(dbPool);
    const target = new GoalTarget({ targetType: 'DAILY', targetValue: 60, targetUnit: 'minutes' });
    const goal = StudyGoal.create({ coachId: 'coach-1', goalType: 'DAILY', title: 'Daily Goal', target });

    await repo.save(goal);
    expect(querySqls.some(sql => sql.includes('INSERT INTO study_goals'))).toBe(true);

    const found = await repo.findById(goal.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Daily Goal');

    const active = await repo.findActiveByCoach('coach-1');
    expect(active.length).toBeGreaterThan(0);
  });

  test('PostgresHabitRepository saves and finds trackers', async () => {
    const repo = new PostgresHabitRepository(dbPool);
    const tracker = HabitTracker.createForDate('coach-1', new Date());

    await repo.save(tracker);
    expect(querySqls.some(sql => sql.includes('INSERT INTO habit_trackers'))).toBe(true);

    const found = await repo.findByCoachAndDate('coach-1', new Date());
    expect(found).toBeDefined();
    expect(found?.studied).toBe(true);
  });

  test('PostgresHabitAnalyticsRepository saves and finds analytics', async () => {
    const repo = new PostgresHabitAnalyticsRepository(dbPool);
    const analytics = HabitAnalytics.create({
      coachId: 'coach-1',
      periodType: 'WEEKLY',
      periodStart: new Date('2026-07-13'),
      periodEnd: new Date('2026-07-19')
    });

    await repo.save(analytics);
    expect(querySqls.some(sql => sql.includes('INSERT INTO habit_analytics'))).toBe(true);

    const found = await repo.findByCoachAndPeriod('coach-1', 'WEEKLY', new Date('2026-07-13'));
    expect(found).toBeDefined();
    expect(found?.currentStreak).toBe(5);
  });

  test('PostgresReflectionRepository saves and finds journals', async () => {
    const repo = new PostgresReflectionRepository(dbPool);
    const entry = new ReflectionEntry({ mood: 'POSITIVE', difficultyRating: 3 });
    const journal = ReflectionJournal.record({ coachId: 'coach-1', entry });

    await repo.save(journal);
    expect(querySqls.some(sql => sql.includes('INSERT INTO reflection_journals'))).toBe(true);

    const history = await repo.findHistoryByCoach('coach-1');
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].entry.mood).toBe('POSITIVE');
  });

  test('PostgresCoachDashboardProjectionRepository saves and finds projections', async () => {
    const repo = new PostgresCoachDashboardProjectionRepository(dbPool);
    const projection = CoachDashboardProjection.createEmpty('coach-1');

    await repo.save(projection);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_dashboard_projections'))).toBe(true);

    const found = await repo.findByCoachId('coach-1');
    expect(found).toBeDefined();
    expect(found?.habitSummary.streak).toBe(5);
  });

  test('PostgresMotivationProfileRepository saves and finds profile', async () => {
    const repo = new PostgresMotivationProfileRepository(dbPool);
    const profile = new MotivationProfile({ id: 'prof-1', coachId: 'coach-1' });

    await repo.save(profile);
    expect(querySqls.some(sql => sql.includes('INSERT INTO motivation_profiles'))).toBe(true);

    const found = await repo.findByCoachId('coach-1');
    expect(found).toBeDefined();
    expect(found?.milestoneCount).toBe(3);
  });

  test('PostgresCoachingSessionRepository saves and finds session', async () => {
    const repo = new PostgresCoachingSessionRepository(dbPool);
    const session = CoachingSession.start('coach-1', 'DAILY_CHECK_IN');

    await repo.save(session);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coaching_sessions'))).toBe(true);

    const found = await repo.findById(session.id);
    expect(found).toBeDefined();
    expect(found?.sessionType).toBe('DAILY_CHECK_IN');
  });

  test('PostgresCoachingPlanRepository saves and finds plan', async () => {
    const repo = new PostgresCoachingPlanRepository(dbPool);
    const plan = CoachingPlan.create({
      coachId: 'coach-1',
      planType: 'WEEKLY',
      startDate: new Date(),
      endDate: new Date()
    });

    await repo.save(plan);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coaching_plans'))).toBe(true);

    const found = await repo.findById(plan.id);
    expect(found).toBeDefined();
    expect(found?.planType).toBe('WEEKLY');
  });

  test('PostgresDailyStudyPlanRepository saves and finds daily plan', async () => {
    const repo = new PostgresDailyStudyPlanRepository(dbPool);
    const daily = DailyStudyPlan.generate('coach-1', new Date());
    const task = new StudyPlanTask({ id: 'task-1', dailyPlanId: daily.id, taskType: 'PRACTICE', title: 'Grammar' });

    await repo.save(daily, [task]);
    expect(querySqls.some(sql => sql.includes('INSERT INTO daily_study_plans'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO study_plan_tasks'))).toBe(true);

    const found = await repo.findByCoachAndDate('coach-1', new Date());
    expect(found).toBeDefined();
    expect(found?.tasks.length).toBeGreaterThan(0);
  });

  test('PostgresRevisionPlanRepository saves and finds revision plan', async () => {
    const repo = new PostgresRevisionPlanRepository(dbPool);
    const campaign = new RevisionCampaign({
      campaignType: 'REVISION_A',
      startDate: new Date(),
      endDate: new Date(),
      focusAreas: []
    });
    const plan = RevisionPlan.create('coach-1', campaign);

    await repo.save(plan);
    expect(querySqls.some(sql => sql.includes('INSERT INTO revision_plans'))).toBe(true);

    const found = await repo.findById(plan.id);
    expect(found).toBeDefined();
    expect(found?.campaign.campaignType).toBe('REVISION_A');
  });

  test('PostgresConversationRepository saves and finds conversation', async () => {
    const repo = new PostgresConversationRepository(dbPool);
    const convo = CoachConversation.start('coach-1');
    const msg = new ConversationMessage({ id: 'msg-1', conversationId: convo.id, role: 'STUDENT', content: 'Help' });

    await repo.save(convo, [msg]);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_conversations'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO conversation_messages'))).toBe(true);

    const found = await repo.findById(convo.id);
    expect(found).toBeDefined();
    expect(found?.messages.length).toBeGreaterThan(0);
  });

  test('PostgresInsightRepository saves and finds insights', async () => {
    const repo = new PostgresInsightRepository(dbPool);
    const insight = CoachInsight.create({
      coachId: 'coach-1',
      category: 'WRITING',
      severity: 'HIGH',
      confidence: 0.85,
      insightText: 'Grammar needs work'
    });

    await repo.save(insight);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_insights'))).toBe(true);

    const found = await repo.findById(insight.id);
    expect(found).toBeDefined();
    expect(found?.category).toBe('WRITING');
  });

  test('PostgresNotificationRepository saves and finds notifications', async () => {
    const repo = new PostgresNotificationRepository(dbPool);
    const notif = CoachNotification.schedule({
      coachId: 'coach-1',
      notificationType: 'STUDY_REMINDER',
      channel: 'IN_APP',
      title: 'Reminder',
      body: 'Time to study',
      scheduledAt: new Date()
    });

    await repo.save(notif);
    expect(querySqls.some(sql => sql.includes('INSERT INTO coach_notifications'))).toBe(true);

    const found = await repo.findById(notif.id);
    expect(found).toBeDefined();
    expect(found?.notificationType).toBe('STUDY_REMINDER');
  });
});
