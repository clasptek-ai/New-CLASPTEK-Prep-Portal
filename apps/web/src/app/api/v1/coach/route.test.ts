/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { GET as getCoach, POST as createCoach } from './route';
import { GET as getPlan, POST as generatePlan } from './plan/route';
import { GET as getGoals, POST as createGoal } from './goals/route';
import { PATCH as updateGoal } from './goals/[id]/route';
import { GET as getConvos, POST as postConvo } from './conversations/route';
import { GET as getHabits, POST as postHabit } from './habits/route';
import { GET as getReflections, POST as postReflection } from './reflections/route';
import { POST as postRevisionPlan } from './revision-plan/route';
import { POST as postMotivation } from './motivation/route';
import { GET as getDashboard } from './dashboard/route';

const dbStore = new Map<string, any>();
let querySqls: string[] = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    querySqls.push(sql);

    if (sql.includes('INSERT INTO learning_coaches')) {
      if (params) dbStore.set('coach-' + params[0], { id: params[0], student_id: params[1], profile_id: params[2], status: params[3] });
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coach_brains')) {
      if (params) dbStore.set('brain-' + params[1], { id: params[0], coach_id: params[1], tone: params[2], pacing: params[3], engine: params[4] });
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coach_memory')) {
      if (params) dbStore.set('memory-' + params[1], { id: params[0], coach_id: params[1] });
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO motivation_profiles')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coaching_sessions')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO study_goals')) {
      if (params) dbStore.set('goal-' + params[0], { id: params[0], coach_id: params[1], goal_type: params[2], status: params[3], title: params[4], target_value: params[6], target_unit: params[8] });
      return { rowCount: 1 };
    }
    if (sql.includes('UPDATE study_goals')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO habit_trackers')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO habit_analytics')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO reflection_journals')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO revision_plans')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coach_conversations')) {
      if (params) dbStore.set('convo-' + params[0], { id: params[0], coach_id: params[1], status: params[4] });
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO conversation_messages')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coach_notifications')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO coach_dashboard_projections')) {
      return { rowCount: 1 };
    }

    // Hydration mocks
    if (sql.includes('FROM learning_coaches WHERE id =')) {
      return { rows: [{ id: 'coach-123', student_id: 'stud-123', profile_id: 'prof-123', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }] };
    }
    if (sql.includes('FROM coach_brains WHERE coach_id =')) {
      return { rows: [{ id: 'brain-123', coach_id: 'coach-123', coaching_style_tone: 'ENCOURAGING', coaching_style_pacing: 'BALANCED', active_engine: 'RULE_BASED', llm_model_id: null, prompt_version: 'v1.0.0', created_at: new Date(), updated_at: new Date() }] };
    }
    if (sql.includes('FROM coach_memory WHERE coach_id =')) {
      return { rows: [{ id: 'mem-123', coach_id: 'coach-123', preferred_study_hours: [], preferred_learning_style: 'VISUAL', preferred_motivation_style: 'ENCOURAGEMENT', recurring_mistakes: [], strongest_subjects: [], weakest_competencies: [], recurring_questions: [], key_milestones: [], notes: '', version: 1, updated_at: new Date() }] };
    }
    if (sql.includes('FROM study_goals WHERE id =')) {
      return { rows: [{ id: 'goal-123', coach_id: 'coach-123', goal_type: 'DAILY', status: 'ACTIVE', title: 'Daily Goal', target_value: '60.00', target_unit: 'minutes', current_value: '30.00', created_at: new Date(), updated_at: new Date() }] };
    }
    if (sql.includes('FROM study_goals WHERE coach_id =')) {
      return { rows: [{ id: 'goal-123', coach_id: 'coach-123', goal_type: 'DAILY', status: 'ACTIVE', title: 'Daily Goal', target_value: '60.00', target_unit: 'minutes', current_value: '30.00', created_at: new Date(), updated_at: new Date() }] };
    }
    if (sql.includes('FROM habit_analytics WHERE coach_id =')) {
      return { rows: [{ id: 'ha-123', coach_id: 'coach-123', period_type: 'WEEKLY', period_start: new Date(), period_end: new Date(), current_streak: 5, longest_streak: 10, weekly_consistency: '85.00', monthly_consistency: '90.00', avg_session_minutes: '45.00', study_velocity: '1.2', computed_at: new Date() }] };
    }
    if (sql.includes('FROM coach_conversations WHERE coach_id =')) {
      return { rows: [{ id: 'convo-123', coach_id: 'coach-123', topic: 'Topic', status: 'ACTIVE', message_count: 2, total_tokens: 20, started_at: new Date() }] };
    }
    if (sql.includes('FROM conversation_messages WHERE conversation_id =')) {
      return { rows: [] };
    }
    if (sql.includes('FROM reflection_journals WHERE coach_id =')) {
      return { rows: [{ id: 'ref-123', coach_id: 'coach-123', mood: 'POSITIVE', difficulty_rating: 3, insights: '', what_went_well: '', what_was_difficult: '', next_session_focus: '', recorded_at: new Date() }] };
    }
    if (sql.includes('FROM coach_dashboard_projections WHERE coach_id =')) {
      return { rows: [{ id: 'proj-123', coach_id: 'coach-123', today_tasks: [], goal_summary: { active: 1, completed: 0, atRisk: 0, failed: 0 }, habit_summary: { streak: 5, consistency: 0.85, todayStudied: false }, latest_motivation: {}, critical_insights: [], prediction_summary: {}, last_computed_at: new Date() }] };
    }

    return { rows: [], rowCount: 0 };
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

describe('AI Learning Coach API Integration Tests', () => {
  beforeEach(() => {
    querySqls = [];
  });

  test('POST /api/v1/coach creates profile', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'stud-123', profileId: 'prof-123' })
    });
    const res = await createCoach(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.coachId).toBeDefined();
    expect(json.status).toBe('ACTIVE');
  });

  test('GET /api/v1/coach retrieves details', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getCoach(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.coach.id).toBe('coach-123');
    expect(json.brain).toBeDefined();
  });

  test('POST /api/v1/coach/plan generates daily plan', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/plan', {
      method: 'POST',
      body: JSON.stringify({ coachId: 'coach-123', studentId: 'stud-123', profileId: 'prof-123' })
    });
    const res = await generatePlan(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.planId).toBeDefined();
  });

  test('GET /api/v1/coach/plan retrieves plan', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/plan?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getPlan(req);
    expect(res.status).toBe(200);
  });

  test('POST /api/v1/coach/goals creates goal', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/goals', {
      method: 'POST',
      body: JSON.stringify({
        coachId: 'coach-123',
        goalType: 'DAILY',
        title: 'Learn 10 words',
        targetValue: 10,
        targetUnit: 'words'
      })
    });
    const res = await createGoal(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.goalId).toBeDefined();
    expect(json.status).toBe('ACTIVE');
  });

  test('GET /api/v1/coach/goals retrieves goals', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/goals?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getGoals(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.goals.length).toBeGreaterThan(0);
  });

  test('PATCH /api/v1/coach/goals/[id] updates progress', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/goals/goal-123', {
      method: 'PATCH',
      body: JSON.stringify({ newValue: 45 })
    });
    const res = await updateGoal(req, { params: Promise.resolve({ id: 'goal-123' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.currentValue).toBe(45);
  });

  test('POST /api/v1/coach/conversations starts conversation', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/conversations', {
      method: 'POST',
      body: JSON.stringify({ coachId: 'coach-123', topic: 'Speaking practice' })
    });
    const res = await postConvo(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.conversationId).toBeDefined();
  });

  test('GET /api/v1/coach/conversations gets history', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/conversations?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getConvos(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.conversations.length).toBeGreaterThan(0);
  });

  test('POST /api/v1/coach/habits checks in study time', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/habits', {
      method: 'POST',
      body: JSON.stringify({ coachId: 'coach-123', date: '2026-07-16', studyMinutes: 45 })
    });
    const res = await postHabit(req);
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/coach/habits gets analytics', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/habits?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getHabits(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.currentStreak).toBe(5);
  });

  test('POST /api/v1/coach/reflections records journal entry', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/reflections', {
      method: 'POST',
      body: JSON.stringify({ coachId: 'coach-123', mood: 'POSITIVE', difficultyRating: 3 })
    });
    const res = await postReflection(req);
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/coach/reflections gets logs', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/reflections?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getReflections(req);
    expect(res.status).toBe(200);
  });

  test('POST /api/v1/coach/revision-plan schedules revision campaign', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/revision-plan', {
      method: 'POST',
      body: JSON.stringify({
        coachId: 'coach-123',
        campaignType: 'REVISION_A',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        focusAreas: ['Reading', 'Vocabulary']
      })
    });
    const res = await postRevisionPlan(req);
    expect(res.status).toBe(201);
  });

  test('POST /api/v1/coach/motivation triggers motivation notification', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/motivation', {
      method: 'POST',
      body: JSON.stringify({
        coachId: 'coach-123',
        studentId: 'stud-123',
        profileId: 'prof-123',
        type: 'ENCOURAGEMENT'
      })
    });
    const res = await postMotivation(req);
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/coach/dashboard retrieves dashboard metrics', async () => {
    const req = new NextRequest('http://localhost/api/v1/coach/dashboard?coachId=coach-123', {
      method: 'GET'
    });
    const res = await getDashboard(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.habitSummary.streak).toBe(5);
  });
});
