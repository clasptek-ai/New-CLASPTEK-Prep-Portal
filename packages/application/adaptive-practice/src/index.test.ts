import { describe, it, expect, vi } from 'vitest';
import {
  QuestionEligibilityEngine,
  SelectionStrategyRegistry,
  CreatePracticePlanHandler,
  StartPracticeSessionHandler,
  type PracticePlanRepository,
  type PracticeSessionRepository,
  type AttemptLog,
} from './index';
import {
  AdaptiveSnapshot,
  PracticePlan,
  PracticeSession,
  PracticeConfiguration,
  DifficultyProfile,
  SessionMode,
  PracticeDuration,
  MasteryThreshold,
} from '@clasptek/domain-adaptive-practice';

describe('QuestionEligibilityEngine', () => {
  const engine = new QuestionEligibilityEngine();

  const mkMockQuestions = () => [
    {
      id: 'q-1',
      status: 'PUBLISHED',
      payload: { difficulty: 'Beginner', competencies: ['comp-1'] },
    },
    {
      id: 'q-2',
      status: 'PUBLISHED',
      payload: { difficulty: 'Intermediate', competencies: ['comp-2'] },
    },
    {
      id: 'q-3',
      status: 'PUBLISHED',
      payload: { difficulty: 'Advanced', competencies: ['comp-1'] },
    },
    { id: 'q-4', status: 'DRAFT', payload: { difficulty: 'Beginner', competencies: ['comp-2'] } },
  ];

  it('filters based on status and difficulty bounds', () => {
    const questions = mkMockQuestions();
    const config = {
      minDifficulty: 'Intermediate',
      maxDifficulty: 'Advanced',
      targetCompetencies: [],
      cooldownRules: { correctDays: 7, incorrectHours: 24, skippedHours: 12 },
    };
    const eligible = engine.filterEligible(questions, [], config);
    expect(eligible).toHaveLength(2);
    expect(eligible.map((q) => q.id)).toContain('q-2');
    expect(eligible.map((q) => q.id)).toContain('q-3');
  });

  it('filters based on target competencies', () => {
    const questions = mkMockQuestions();
    const config = {
      minDifficulty: 'Beginner',
      maxDifficulty: 'Advanced',
      targetCompetencies: ['comp-2'],
      cooldownRules: { correctDays: 7, incorrectHours: 24, skippedHours: 12 },
    };
    const eligible = engine.filterEligible(questions, [], config);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe('q-2');
  });

  it('enforces spacing cooldown intervals', () => {
    const questions = mkMockQuestions();
    const now = new Date('2026-07-16T12:00:00Z');
    const attempts: AttemptLog[] = [
      {
        questionVersionId: 'q-1',
        answeredAt: new Date('2026-07-16T11:00:00Z'), // 1 hour ago
        wasCorrect: true, // Cooldown is 7 days
        wasSkipped: false,
      },
      {
        questionVersionId: 'q-2',
        answeredAt: new Date('2026-07-16T11:30:00Z'), // 30 minutes ago
        wasCorrect: false, // Cooldown is 24 hours
        wasSkipped: false,
      },
    ];

    const config = {
      minDifficulty: 'Beginner',
      maxDifficulty: 'Advanced',
      targetCompetencies: [],
      cooldownRules: { correctDays: 7, incorrectHours: 24, skippedHours: 12 },
    };

    const eligible = engine.filterEligible(questions, attempts, config, now);
    // q-1 and q-2 are on cooldown, q-3 is Advanced, q-4 is DRAFT. Only q-3 remains.
    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe('q-3');
  });
});

describe('SelectionStrategyRegistry', () => {
  const registry = new SelectionStrategyRegistry();
  const snapshot = new AdaptiveSnapshot({
    id: 'snap-1',
    studentId: 'student-1',
    competencyLevels: { 'comp-1': 20, 'comp-2': 80 },
    difficultyProfile: { minLevel: 'Intermediate', maxLevel: 'Advanced', progressionRate: 1.1 },
    weakAreas: ['comp-1'],
    strengths: ['comp-2'],
    recommendationScore: 75.0,
    timestamp: new Date(),
  });

  const mockQuestions = [
    { id: 'q-1', payload: { difficulty: 'Beginner', competencies: ['comp-1'] } },
    { id: 'q-2', payload: { difficulty: 'Intermediate', competencies: ['comp-2'] } },
    { id: 'q-3', payload: { difficulty: 'Intermediate', competencies: ['comp-1'] } },
  ];

  it('WEAKEST_FIRST strategy prioritizes weakest competency questions', async () => {
    const strategy = registry.get('WEAKEST_FIRST');
    const selected = await strategy.execute(mockQuestions, snapshot, 2);
    expect(selected).toHaveLength(2);
    // weakest is comp-1 (q-1 and q-3)
    expect(selected[0].id).toBe('q-1');
    expect(selected[1].id).toBe('q-3');
  });

  it('BALANCED strategy distributes questions evenly', async () => {
    const strategy = registry.get('BALANCED');
    const selected = await strategy.execute(mockQuestions, snapshot, 2);
    expect(selected).toHaveLength(2);
    // Distributes between comp-1 and comp-2. First from comp-1 (q-1), second from comp-2 (q-2)
    expect(selected[0].id).toBe('q-1');
    expect(selected[1].id).toBe('q-2');
  });
});

describe('Command Handlers', () => {
  const mkMockPlanRepo = (): PracticePlanRepository => {
    const store = new Map<string, PracticePlan>();
    return {
      save: vi.fn(async (plan) => {
        store.set(plan.id, plan);
      }),
      findById: vi.fn(async (id) => store.get(id) ?? null),
      findByStudent: vi.fn(async () => []),
      nextIdentity: () => 'plan-uuid',
    };
  };

  const mkMockSessionRepo = (): PracticeSessionRepository => {
    const store = new Map<string, PracticeSession>();
    return {
      save: vi.fn(async (session) => {
        store.set(session.id, session);
      }),
      findById: vi.fn(async (id) => store.get(id) ?? null),
      findActive: vi.fn(async () => null),
      search: vi.fn(async () => []),
      archive: vi.fn(async () => {}),
      restore: vi.fn(async () => {}),
      nextIdentity: () => 'session-uuid',
    };
  };

  it('CreatePracticePlanHandler runs successfully', async () => {
    const repo = mkMockPlanRepo();
    const handler = new CreatePracticePlanHandler(repo);
    const id = await handler.execute({
      studentId: 'student-1',
      selectionRules: [{ attributeName: 'type', operator: 'EQUALS', value: 'MCQ' }],
      targetedCompetencies: [{ competencyId: 'comp-1', weight: 1.0, targetPercentage: 100 }],
      spacingPolicy: { reviewIntervalHours: 24, expansionFactor: 1.5, maxIntervalHours: 168 },
    });

    expect(id).toBe('plan-uuid');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('StartPracticeSessionHandler starts the session', async () => {
    const repo = mkMockSessionRepo();
    const session = new PracticeSession({
      id: 'sess-1',
      studentId: 'student-1',
      planId: 'plan-1',
      status: 'GENERATED',
      configuration: new PracticeConfiguration({
        id: 'cfg-1',
        mode: new SessionMode('Timed'),
        durationTarget: new PracticeDuration(600000),
        allowedRepeats: false,
        masteryThreshold: new MasteryThreshold(75),
      }),
      difficultyProfile: new DifficultyProfile({
        id: 'diff-1',
        minLevel: 'Beginner',
        maxLevel: 'Advanced',
        progressionRate: 1.1,
      }),
    });
    await repo.save(session);

    const handler = new StartPracticeSessionHandler(repo);
    await handler.execute({ sessionId: 'sess-1' });

    const saved = await repo.findById('sess-1');
    expect(saved?.status).toBe('ACTIVE');
  });
});

// ─────────────────────────────────────────────────────────────────
// Sprint 2.6 Addendum Application Handler Tests
// ─────────────────────────────────────────────────────────────────

import {
  SetPracticeGoalHandler,
  UpdateRetentionHandler,
  GenerateDailyGoalHandler,
  AwardMotivationPointsHandler,
  GetFocusAreaRecommendationsQueryHandler,
  type PracticeGoalRepository,
  type RetentionRepository,
  type DailyGoalRepository,
  type MotivationRepository,
} from './index';
import {
  StudentPracticeGoal,
  RetentionProfile,
  StudentDailyGoal,
  StudentMotivation,
} from '@clasptek/domain-adaptive-practice';

function mkGoalRepo(): PracticeGoalRepository {
  const store = new Map<string, StudentPracticeGoal>();
  return {
    save: vi.fn(async (g) => {
      store.set(g.id, g);
    }),
    findByStudent: vi.fn(async (id) =>
      Array.from(store.values()).filter((g) => g.studentId === id)
    ),
    findActive: vi.fn(
      async (id) =>
        Array.from(store.values()).find((g) => g.studentId === id && g.status === 'ACTIVE') ?? null
    ),
    nextIdentity: () => 'goal-uuid',
  };
}

function mkRetentionRepo(): RetentionRepository {
  const store = new Map<string, RetentionProfile>();
  return {
    save: vi.fn(async (p) => {
      store.set(`${p.studentId}:${p.competencyId}`, p);
    }),
    findByStudent: vi.fn(async (id) =>
      Array.from(store.values()).filter((p) => p.studentId === id)
    ),
    findByStudentAndCompetency: vi.fn(async (sId, cId) => store.get(`${sId}:${cId}`) ?? null),
    nextIdentity: () => 'retention-uuid',
  };
}

function mkDailyGoalRepo(): DailyGoalRepository {
  const store = new Map<string, StudentDailyGoal>();
  return {
    save: vi.fn(async (g) => {
      store.set(`${g.studentId}:${g.targetDate}`, g);
    }),
    findByStudentAndDate: vi.fn(async (sId, d) => store.get(`${sId}:${d}`) ?? null),
    nextIdentity: () => 'daily-uuid',
  };
}

function mkMotivationRepo(): MotivationRepository {
  const store = new Map<string, StudentMotivation>();
  return {
    save: vi.fn(async (m) => {
      store.set(m.studentId, m);
    }),
    findByStudent: vi.fn(async (id) => store.get(id) ?? null),
    nextIdentity: () => 'motivation-uuid',
  };
}

describe('SetPracticeGoalHandler', () => {
  it('sets practice goal for student', async () => {
    const repo = mkGoalRepo();
    const handler = new SetPracticeGoalHandler(repo);
    const id = await handler.execute({
      studentId: 's-1',
      goalType: 'IMPROVE_GRAMMAR_ACCURACY',
      goalTitle: 'Improve Grammar Accuracy',
      targetValue: 85,
    });
    expect(id).toBe('goal-uuid');
    const goals = await repo.findByStudent('s-1');
    expect(goals).toHaveLength(1);
    expect(goals[0].goalTitle).toBe('Improve Grammar Accuracy');
  });
});

describe('UpdateRetentionHandler', () => {
  it('updates spaced repetition retention profile', async () => {
    const repo = mkRetentionRepo();
    const handler = new UpdateRetentionHandler(repo);
    const profile = await handler.execute({
      studentId: 's-1',
      competencyId: 'grammar',
      wasCorrect: true,
    });
    expect(profile.retentionScore).toBeGreaterThan(100 - 1);
  });
});

describe('GenerateDailyGoalHandler', () => {
  it('generates adaptive daily goal', async () => {
    const repo = mkDailyGoalRepo();
    const handler = new GenerateDailyGoalHandler(repo);
    const goal = await handler.execute({ studentId: 's-1', learningPace: 'Accelerated' });
    expect(goal.targetQuestions).toBe(25);
  });
});

describe('AwardMotivationPointsHandler', () => {
  it('awards XP and practice points', async () => {
    const repo = mkMotivationRepo();
    const handler = new AwardMotivationPointsHandler(repo);
    const motivation = await handler.execute({
      studentId: 's-1',
      accuracy: 90,
      timeSpentMs: 12000,
    });
    expect(motivation.xp).toBeGreaterThan(0);
    expect(motivation.practicePoints).toBeGreaterThan(0);
  });
});

describe('GetFocusAreaRecommendationsQueryHandler', () => {
  it('recommends focus area based on scores', async () => {
    const handler = new GetFocusAreaRecommendationsQueryHandler();
    const area = await handler.execute({ grammarAccuracy: 55, readingSpeedWpm: 220 });
    expect(area).toBe('Grammar');
  });
});
