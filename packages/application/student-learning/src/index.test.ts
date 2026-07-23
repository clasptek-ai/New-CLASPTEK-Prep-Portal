import { describe, it, expect, vi } from 'vitest';
import {
  CreateJourneyHandler,
  ActivateJourneyHandler,
  EnrolProgrammeHandler,
  StartStudySessionHandler,
  EndStudySessionHandler,
  CreateLearningGoalHandler,
  GetStudyStatisticsHandler,
  type StudentLearningRepository,
  type ProgrammeEnrollmentRepository,
} from './index';
import {
  StudentLearningJourney,
  StudentProgrammeEnrollment,
} from '@clasptek/domain-student-learning';

// ─────────────────────────────────────────────────────────────────
// Mock Repositories
// ─────────────────────────────────────────────────────────────────

function mkJourneyRepo(): StudentLearningRepository {
  const store = new Map<string, StudentLearningJourney>();
  return {
    save: vi.fn(async (j) => {
      store.set(j.id, j);
    }),
    findById: vi.fn(async (id) => store.get(id) ?? null),
    findByStudent: vi.fn(async () => null),
    findActive: vi.fn(async () => null),
    archive: vi.fn(async () => {}),
    restore: vi.fn(async () => {}),
    search: vi.fn(async () => []),
    nextIdentity: () => 'journey-uuid',
  };
}

function mkEnrollmentRepo(): ProgrammeEnrollmentRepository {
  const store = new Map<string, StudentProgrammeEnrollment>();
  return {
    save: vi.fn(async (e) => {
      store.set(e.id, e);
    }),
    findById: vi.fn(async (id) => store.get(id) ?? null),
    findByJourney: vi.fn(async () => []),
    findByStudentAndProgramme: vi.fn(async () => null),
    findActive: vi.fn(async () => []),
    nextIdentity: () => 'enrollment-uuid',
  };
}

// ─────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────

describe('CreateJourneyHandler', () => {
  it('creates a new journey for a student without one', async () => {
    const repo = mkJourneyRepo();
    const handler = new CreateJourneyHandler(repo);
    const id = await handler.execute({ studentId: 'student-1' });
    expect(id).toBe('journey-uuid');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('throws if the student already has a journey', async () => {
    const repo = mkJourneyRepo();
    const existing = StudentLearningJourney.create('j-existing', 'student-1');
    (repo.findByStudent as any).mockResolvedValue(existing);
    const handler = new CreateJourneyHandler(repo);
    await expect(handler.execute({ studentId: 'student-1' })).rejects.toThrow();
  });
});

describe('ActivateJourneyHandler', () => {
  it('activates an existing CREATED journey', async () => {
    const repo = mkJourneyRepo();
    const journey = StudentLearningJourney.create('j-1', 'student-1');
    await repo.save(journey);
    const handler = new ActivateJourneyHandler(repo);
    await handler.execute({ journeyId: 'j-1' });
    const saved = await repo.findById('j-1');
    expect(saved?.status).toBe('ACTIVE');
  });
});

describe('EnrolProgrammeHandler', () => {
  it('creates enrollment for an ACTIVE journey', async () => {
    const journeyRepo = mkJourneyRepo();
    const enrollmentRepo = mkEnrollmentRepo();
    const journey = StudentLearningJourney.create('j-1', 'student-1');
    journey.activate();
    await journeyRepo.save(journey);

    const handler = new EnrolProgrammeHandler(journeyRepo, enrollmentRepo);
    const id = await handler.execute({
      journeyId: 'j-1',
      programmeId: 'prog-1',
      programmeVersionId: 'ver-1',
      deliveryMode: 'ONLINE',
    });
    expect(id).toBe('enrollment-uuid');
    expect(enrollmentRepo.save).toHaveBeenCalledOnce();
  });

  it('throws if journey is not ACTIVE', async () => {
    const journeyRepo = mkJourneyRepo();
    const enrollmentRepo = mkEnrollmentRepo();
    const journey = StudentLearningJourney.create('j-2', 'student-2');
    // CREATED, not activated
    await journeyRepo.save(journey);
    const handler = new EnrolProgrammeHandler(journeyRepo, enrollmentRepo);
    await expect(
      handler.execute({
        journeyId: 'j-2',
        programmeId: 'prog-1',
        programmeVersionId: 'ver-1',
      })
    ).rejects.toThrow();
  });
});

describe('StudySession flow', () => {
  it('starts and ends a study session', async () => {
    const repo = mkJourneyRepo();
    const journey = StudentLearningJourney.create('j-1', 's-1');
    journey.activate();
    await repo.save(journey);

    const startHandler = new StartStudySessionHandler(repo);
    const sessionId = await startHandler.execute({
      journeyId: 'j-1',
      platform: 'Web',
      deviceType: 'Desktop',
      timezone: 'Europe/London',
    });
    expect(typeof sessionId).toBe('string');

    const endHandler = new EndStudySessionHandler(repo);
    await endHandler.execute({ journeyId: 'j-1', sessionId, durationMs: 1800000 });

    const saved = await repo.findById('j-1');
    expect(saved?.streak.current).toBe(1);
  });
});

describe('CreateLearningGoalHandler', () => {
  it('adds a goal to an ACTIVE journey', async () => {
    const repo = mkJourneyRepo();
    const journey = StudentLearningJourney.create('j-1', 's-1');
    journey.activate();
    await repo.save(journey);

    const handler = new CreateLearningGoalHandler(repo);
    const goalId = await handler.execute({
      journeyId: 'j-1',
      title: 'Pass IELTS 7.5',
      priority: 'HIGH',
    });
    expect(typeof goalId).toBe('string');
    const saved = await repo.findById('j-1');
    expect(saved?.goals).toHaveLength(1);
  });
});

describe('GetStudyStatisticsHandler', () => {
  it('returns correct statistics for a journey with sessions and goals', async () => {
    const repo = mkJourneyRepo();
    const journey = StudentLearningJourney.create('j-1', 's-1');
    journey.activate();
    const { StudySession, LearningGoal } = await import('@clasptek/domain-student-learning');
    const session = new StudySession({ id: 'sess-1', startedAt: new Date() });
    journey.startStudySession(session);
    journey.endStudySession('sess-1', new Date(), 3600000);
    const goal = new LearningGoal({ id: 'g-1', title: 'Pass', priority: 'HIGH', status: 'ACTIVE' });
    journey.addGoal(goal);
    journey.completeGoal('g-1');
    await repo.save(journey);

    const handler = new GetStudyStatisticsHandler(repo);
    const stats = await handler.execute({ journeyId: 'j-1' });
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalStudyTimeMs).toBe(3600000);
    expect(stats.currentStreak).toBe(1);
    expect(stats.goalsCompleted).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────
// Addendum Handler Tests
// ─────────────────────────────────────────────────────────────────

import {
  SetLearningPaceHandler,
  SetTargetExamDateHandler,
  CalculateReadinessHandler,
  RunInterventionsHandler,
  type StudentLearningProfileRepository,
  type ReadinessRepository,
  type InterventionRepository,
} from './index';
import {
  StudentLearningProfile,
  StudentProgress,
  StudentIntervention,
} from '@clasptek/domain-student-learning';

function mkProfileRepo(): StudentLearningProfileRepository {
  const store = new Map<string, StudentLearningProfile>();
  return {
    save: vi.fn(async (p) => {
      store.set(p.studentId, p);
    }),
    findByStudent: vi.fn(async (id) => store.get(id) ?? null),
    nextIdentity: () => 'profile-uuid',
  };
}

function mkReadinessRepo(): ReadinessRepository {
  const store = new Map<string, StudentProgress>();
  return {
    saveProgress: vi.fn(async (p) => {
      store.set(p.studentId, p);
    }),
    findProgressByJourney: vi.fn(async () => null),
    findProgressByStudent: vi.fn(async (id) => store.get(id) ?? null),
    nextIdentity: () => 'progress-uuid',
  };
}

function mkInterventionRepo(): InterventionRepository {
  const store: StudentIntervention[] = [];
  return {
    saveIntervention: vi.fn(async (i) => {
      store.push(i);
    }),
    findInterventionsByStudent: vi.fn(async (id) => store.filter((i) => i.studentId === id)),
    findActiveInterventionsByStudent: vi.fn(async (id) =>
      store.filter((i) => i.studentId === id && i.status === 'ACTIVE')
    ),
    findInterventionById: vi.fn(async (id) => store.find((i) => i.id === id) ?? null),
    nextIdentity: () => 'intervention-uuid',
  };
}

describe('SetLearningPaceHandler', () => {
  it('sets learning pace and default hours for a student profile', async () => {
    const repo = mkProfileRepo();
    const handler = new SetLearningPaceHandler(repo);
    const profileId = await handler.execute({ studentId: 's-1', pace: 'Accelerated' });
    expect(profileId).toBe('profile-uuid');
    const profile = await repo.findByStudent('s-1');
    expect(profile?.learningPace.value).toBe('Accelerated');
    expect(profile?.weeklyStudyHours).toBe(18);
  });
});

describe('SetTargetExamDateHandler', () => {
  it('updates enrollment target exam date', async () => {
    const enrollmentRepo = mkEnrollmentRepo();
    const enrollment = StudentProgrammeEnrollment.create('enr-1', 'j-1', 's-1', 'p-1', 'v-1');
    await enrollmentRepo.save(enrollment);
    (enrollmentRepo.findByJourney as any).mockResolvedValue([enrollment]);

    const handler = new SetTargetExamDateHandler(enrollmentRepo);
    const targetDate = new Date('2026-10-18');
    await handler.execute({
      journeyId: 'j-1',
      programmeId: 'p-1',
      targetExamDate: targetDate,
      targetScore: 7.5,
    });

    expect(enrollment.targetExamDate?.date).toEqual(targetDate);
    expect(enrollment.targetScore?.value).toBe(7.5);
  });
});

describe('CalculateReadinessHandler', () => {
  it('calculates and saves readiness progress', async () => {
    const journeyRepo = mkJourneyRepo();
    const readinessRepo = mkReadinessRepo();
    const profileRepo = mkProfileRepo();

    const handler = new CalculateReadinessHandler(journeyRepo, readinessRepo, profileRepo);
    const res = await handler.execute({
      journeyId: 'j-1',
      studentId: 's-1',
      diagnosticPerformance: 80,
      practiceScores: 85,
      mockScores: 80,
      curriculumCompletion: 70,
      lessonConsistency: 90,
    });

    expect(res.readinessScore).toBeGreaterThanOrEqual(70);
    expect(res.readinessLevel).toBeDefined();
  });
});

describe('RunInterventionsHandler', () => {
  it('evaluates activity snapshot and saves interventions', async () => {
    const journeyRepo = mkJourneyRepo();
    const interventionRepo = mkInterventionRepo();
    const readinessRepo = mkReadinessRepo();

    const handler = new RunInterventionsHandler(journeyRepo, interventionRepo, readinessRepo);
    const interventions = await handler.execute({
      journeyId: 'j-1',
      studentId: 's-1',
      daysSinceLastLogin: 10,
      missedWeeklyTargets: true,
    });

    expect(interventions.length).toBeGreaterThanOrEqual(2);
    expect(interventionRepo.saveIntervention).toHaveBeenCalled();
  });
});
