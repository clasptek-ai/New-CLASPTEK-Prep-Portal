import { describe, it, expect } from 'vitest';
import {
  StudentLearningJourney,
  StudentProgrammeEnrollment,
  LearningPlan,
  LearningGoal,
  LearningMilestone,
  StudySession,
  Achievement,
  Bookmark,
  CompletionPercentage,
  MasteryScore,
  StudyDuration,
} from './index';

// ─────────────────────────────────────────────────────────────────
// Value Object Tests
// ─────────────────────────────────────────────────────────────────

describe('CompletionPercentage', () => {
  it('accepts 0 and 100', () => {
    expect(new CompletionPercentage(0).value).toBe(0);
    expect(new CompletionPercentage(100).value).toBe(100);
    expect(new CompletionPercentage(57.5).value).toBe(57.5);
  });

  it('rejects values outside 0–100', () => {
    expect(() => new CompletionPercentage(-1)).toThrow();
    expect(() => new CompletionPercentage(101)).toThrow();
  });
});

describe('MasteryScore', () => {
  it('accepts valid scores', () => {
    expect(new MasteryScore(80).value).toBe(80);
  });
  it('rejects invalid scores', () => {
    expect(() => new MasteryScore(-5)).toThrow();
    expect(() => new MasteryScore(105)).toThrow();
  });
});

describe('StudyDuration', () => {
  it('calculates minutes and hours', () => {
    const d = new StudyDuration(7200000);
    expect(d.hours).toBe(2);
    expect(d.minutes).toBe(120);
  });
  it('rejects negative duration', () => {
    expect(() => new StudyDuration(-1)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────
// StudentLearningJourney Aggregate Tests
// ─────────────────────────────────────────────────────────────────

describe('StudentLearningJourney', () => {
  const mkJourney = (status?: string) => {
    const j = StudentLearningJourney.create('journey-1', 'student-1');
    if (status === 'ACTIVE') j.activate();
    if (status === 'PAUSED') {
      j.activate();
      j.pause();
    }
    return j;
  };

  it('creates journey in CREATED status with domain event', () => {
    const j = StudentLearningJourney.create('j-1', 'student-1');
    expect(j.status).toBe('CREATED');
    expect(j.studentId).toBe('student-1');
    expect(j.domainEvents).toHaveLength(1);
    expect((j.domainEvents[0] as any).eventName).toBe('StudentJourneyCreated');
  });

  it('activates from CREATED', () => {
    const j = mkJourney();
    j.activate();
    expect(j.status).toBe('ACTIVE');
  });

  it('cannot activate twice', () => {
    const j = mkJourney('ACTIVE');
    expect(() => j.activate()).toThrow();
  });

  it('pauses an ACTIVE journey', () => {
    const j = mkJourney('ACTIVE');
    j.pause();
    expect(j.status).toBe('PAUSED');
  });

  it('resumes a PAUSED journey', () => {
    const j = mkJourney('PAUSED');
    j.resume();
    expect(j.status).toBe('ACTIVE');
  });

  it('archives a PAUSED journey', () => {
    const j = mkJourney('PAUSED');
    j.archive();
    expect(j.status).toBe('ARCHIVED');
  });

  it('cannot archive an ACTIVE journey', () => {
    const j = mkJourney('ACTIVE');
    expect(() => j.archive()).toThrow();
  });

  it('adds a goal to ACTIVE journey', () => {
    const j = mkJourney('ACTIVE');
    const goal = new LearningGoal({
      id: 'g-1',
      title: 'Pass IELTS',
      priority: 'HIGH',
      status: 'ACTIVE',
    });
    j.addGoal(goal);
    expect(j.goals).toHaveLength(1);
  });

  it('cannot add a goal to non-ACTIVE journey', () => {
    const j = mkJourney('PAUSED');
    const goal = new LearningGoal({
      id: 'g-2',
      title: 'Pass IELTS',
      priority: 'MEDIUM',
      status: 'DRAFT',
    });
    expect(() => j.addGoal(goal)).toThrow();
  });

  it('completes an existing goal', () => {
    const j = mkJourney('ACTIVE');
    const goal = new LearningGoal({
      id: 'g-3',
      title: 'Goal',
      priority: 'LOW',
      status: 'ACTIVE',
    });
    j.addGoal(goal);
    j.completeGoal('g-3');
    expect(j.goals[0].status).toBe('COMPLETED');
    const event = j.domainEvents.find((e: any) => e.eventName === 'GoalCompleted');
    expect(event).toBeDefined();
  });

  it('starts a study session on ACTIVE journey', () => {
    const j = mkJourney('ACTIVE');
    const session = new StudySession({
      id: 's-1',
      startedAt: new Date(),
      platform: 'Web',
      deviceType: 'Desktop',
      timezone: 'Europe/London',
    });
    j.startStudySession(session);
    expect(j.sessions).toHaveLength(1);
  });

  it('prevents overlapping study sessions', () => {
    const j = mkJourney('ACTIVE');
    const s1 = new StudySession({ id: 's-1', startedAt: new Date() });
    j.startStudySession(s1);
    const s2 = new StudySession({ id: 's-2', startedAt: new Date() });
    expect(() => j.startStudySession(s2)).toThrow();
  });

  it('ends a session and updates streak', () => {
    const j = mkJourney('ACTIVE');
    const now = new Date();
    const s = new StudySession({ id: 's-3', startedAt: now });
    j.startStudySession(s);
    j.endStudySession('s-3', new Date(now.getTime() + 3600000), 3600000);
    expect(j.streak.current).toBe(1);
    expect(j.streak.longest).toBe(1);
    const endEvent = j.domainEvents.find((e: any) => e.eventName === 'StudySessionEnded');
    expect(endEvent).toBeDefined();
  });

  it('adds and removes bookmarks (generalized)', () => {
    const j = mkJourney('ACTIVE');
    const bm = new Bookmark({
      id: 'bm-1',
      resourceType: 'LESSON',
      resourceId: 'lesson-99',
      createdAt: new Date(),
    });
    j.addBookmark(bm);
    expect(j.bookmarks).toHaveLength(1);
    j.removeBookmark('bm-1');
    expect(j.bookmarks).toHaveLength(0);
  });

  it('prevents duplicate bookmarks for same resource', () => {
    const j = mkJourney('ACTIVE');
    const bm = new Bookmark({
      id: 'bm-2',
      resourceType: 'MODULE',
      resourceId: 'mod-1',
      createdAt: new Date(),
    });
    j.addBookmark(bm);
    const bm2 = new Bookmark({
      id: 'bm-3',
      resourceType: 'MODULE',
      resourceId: 'mod-1',
      createdAt: new Date(),
    });
    expect(() => j.addBookmark(bm2)).toThrow();
  });

  it('unlocks an achievement idempotently', () => {
    const j = mkJourney('ACTIVE');
    const a = new Achievement({
      id: 'ach-1',
      achievementType: 'FIRST_SESSION',
      unlockedAt: new Date(),
    });
    j.unlockAchievement(a);
    j.unlockAchievement(a); // second call should not throw
    expect(j.achievements).toHaveLength(1);
  });

  it('updates competency with mastery score and records history', () => {
    const j = mkJourney('ACTIVE');
    j.updateCompetency('comp-1', 70, 'QUIZ', 'system');
    expect(j.competencies).toHaveLength(1);
    expect(j.competencies[0].masteryScore).toBe(70);
    expect(j.competencies[0].history).toHaveLength(1);
    j.updateCompetency('comp-1', 85);
    expect(j.competencies[0].masteryScore).toBe(85);
    expect(j.competencies[0].history).toHaveLength(2);
    expect(j.competencies[0].history[1].previousScore).toBe(70);
  });

  it('completes a milestone and fires event', () => {
    const j = mkJourney('ACTIVE');
    const m = new LearningMilestone({
      id: 'ms-1',
      title: 'First Week',
      milestoneType: 'WEEKLY',
      completed: false,
    });
    j.addMilestone(m);
    j.completeMilestone('ms-1');
    expect(j.milestones[0].completed).toBe(true);
    const e = j.domainEvents.find((ev: any) => ev.eventName === 'MilestoneCompleted');
    expect(e).toBeDefined();
  });

  it('records consent for privacy compliance', () => {
    const j = mkJourney();
    j.giveConsent('GDPR-84-MONTHS');
    expect(j.consentGiven).toBe(true);
    expect(j.dataRetentionPolicy).toBe('GDPR-84-MONTHS');
  });
});

// ─────────────────────────────────────────────────────────────────
// StudentProgrammeEnrollment Tests
// ─────────────────────────────────────────────────────────────────

describe('StudentProgrammeEnrollment', () => {
  const mkEnrollment = () =>
    StudentProgrammeEnrollment.create('enr-1', 'journey-1', 'student-1', 'prog-1', 'ver-1', {
      deliveryMode: 'ONLINE',
      cohortId: 'cohort-A',
    });

  it('creates enrollment in ACTIVE status', () => {
    const e = mkEnrollment();
    expect(e.status).toBe('ACTIVE');
    expect(e.paymentVerified).toBe(false);
    expect(e.domainEvents).toHaveLength(1);
    expect((e.domainEvents[0] as any).eventName).toBe('ProgrammeEnrolled');
  });

  it('withdraws an ACTIVE enrollment', () => {
    const e = mkEnrollment();
    e.withdraw('No longer required');
    expect(e.status).toBe('WITHDRAWN');
    expect(e.withdrawalReason).toBe('No longer required');
  });

  it('completes an ACTIVE enrollment', () => {
    const e = mkEnrollment();
    e.complete();
    expect(e.status).toBe('COMPLETED');
    expect(e.completedAt).toBeDefined();
  });

  it('suspends and reinstates an enrollment', () => {
    const e = mkEnrollment();
    e.suspend();
    expect(e.status).toBe('SUSPENDED');
    e.reinstate();
    expect(e.status).toBe('ACTIVE');
  });

  it('cannot withdraw a completed enrollment', () => {
    const e = mkEnrollment();
    e.complete();
    expect(() => e.withdraw('reason')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────
// LearningPlan Tests
// ─────────────────────────────────────────────────────────────────

describe('LearningPlan', () => {
  it('creates a plan and adds a versioned plan entry', () => {
    const plan = LearningPlan.create('plan-1', 'journey-1', 'student-1', 'IELTS 2026 Plan');
    expect(plan.status).toBe('ACTIVE');
    plan.addVersion({
      versionNo: '1.0.0',
      source: 'AI_GENERATED',
      notes: 'Initial AI recommendation',
    });
    expect(plan.versions).toHaveLength(1);
    expect(plan.currentVersion?.versionNo).toBe('1.0.0');
    expect(plan.currentVersion?.source).toBe('AI_GENERATED');
  });

  it('fires LearningPlanUpdated event on version add', () => {
    const plan = LearningPlan.create('plan-2', 'journey-2', 'student-2');
    plan.addVersion({ versionNo: '1.0.0', source: 'INSTRUCTOR' });
    const e = plan.domainEvents.find((ev: any) => ev.eventName === 'LearningPlanUpdated');
    expect(e).toBeDefined();
  });

  it('archives a plan', () => {
    const plan = LearningPlan.create('plan-3', 'j-3', 's-3');
    plan.archive();
    expect(plan.status).toBe('ARCHIVED');
  });

  it('cannot add a version to an archived plan', () => {
    const plan = LearningPlan.create('plan-4', 'j-4', 's-4');
    plan.archive();
    expect(() => plan.addVersion({ versionNo: '2.0.0', source: 'STUDENT' })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────
// Sprint 2.5 Addendum Value Object & Aggregate Tests
// ─────────────────────────────────────────────────────────────────

import {
  LearningPace,
  TargetExamDate,
  TargetScore,
  ReadinessScore,
  StudentIntervention,
  ReadinessCalculator,
  StudyPlanEngine,
  InterventionEngine,
} from './index';

describe('LearningPace', () => {
  it('creates valid learning pace and returns default study hours', () => {
    const p1 = new LearningPace('Accelerated');
    expect(p1.value).toBe('Accelerated');
    expect(p1.defaultWeeklyStudyHours).toBe(18);

    const p2 = new LearningPace('Intensive');
    expect(p2.defaultWeeklyStudyHours).toBe(25);
  });

  it('throws on invalid pace', () => {
    expect(() => new LearningPace('SuperFast' as any)).toThrow();
  });
});

describe('TargetExamDate & TargetScore', () => {
  it('calculates days and weeks remaining correctly', () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    const ted = new TargetExamDate(targetDate);
    expect(ted.daysRemaining()).toBe(14);
    expect(ted.weeksRemaining()).toBe(2);
  });

  it('creates valid TargetScore and rejects out-of-bounds', () => {
    const ts = new TargetScore(7.5);
    expect(ts.value).toBe(7.5);
    expect(() => new TargetScore(-1)).toThrow();
  });
});

describe('ReadinessScore & ReadinessCalculator', () => {
  it('maps scores to readiness levels correctly', () => {
    expect(new ReadinessScore(30).level).toBe('HIGH_RISK');
    expect(new ReadinessScore(50).level).toBe('NEEDS_IMPROVEMENT');
    expect(new ReadinessScore(70).level).toBe('NEARLY_READY');
    expect(new ReadinessScore(90).level).toBe('EXAM_READY');
  });

  it('calculates weighted readiness score via ReadinessCalculator', () => {
    const calc = new ReadinessCalculator();
    const score = calc.calculate({
      diagnosticPerformance: 70,
      practiceScores: 80,
      mockScores: 75,
      curriculumCompletion: 60,
      lessonConsistency: 85,
      learningPace: 'Accelerated',
      weakSkillAreasCount: 1,
    });
    expect(score.value).toBeGreaterThanOrEqual(60);
    expect(score.level).toBeDefined();
  });
});

describe('StudyPlanEngine calculations', () => {
  it('computes lessons per week and revision window correctly', () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 35);
    const result = StudyPlanEngine.calculateSchedule(
      new TargetExamDate(targetDate),
      20, // 20 lessons remaining
      15 // 15 hours/week
    );
    expect(result.remainingWeeks).toBe(5);
    expect(result.lessonsPerWeek).toBe(4);
    expect(result.practiceSessionsPerWeek).toBe(5);
    expect(result.revisionWindowDays).toBe(14);
  });
});

describe('InterventionEngine & StudentIntervention', () => {
  it('evaluates inactivity and low readiness rules', () => {
    const engine = new InterventionEngine();
    const result = engine.evaluate({
      daysSinceLastLogin: 8,
      missedWeeklyTargets: true,
      repeatedLessonFailures: 0,
      readinessScore: 35,
      completionPercentage: 20,
      weakCompetenciesCount: 3,
      missedStudySessionsCount: 2,
      assessmentScoreTrend: 'DECLINING',
    });

    expect(result.triggeredRules).toContain('RULE_NO_LOGIN_7D');
    expect(result.triggeredRules).toContain('RULE_LOW_READINESS');
    expect(result.recommendedActions).toContain('Notify Student');
    expect(result.interventionsToCreate.length).toBeGreaterThanOrEqual(3);
  });

  it('creates StudentIntervention and emits StudentAtRisk event', () => {
    const intervention = StudentIntervention.create('si-1', 'j-1', 's-1', 'RULE_NO_LOGIN_7D', {
      interventionType: 'INACTIVITY_ALERT',
      title: '7 Days Inactivity',
      description: 'Student inactive',
      triggerReason: 'No login for 7 days',
      actionRecommended: 'Notify Student',
    });

    expect(intervention.status).toBe('ACTIVE');
    expect((intervention.domainEvents[0] as any).eventName).toBe('StudentAtRisk');
  });
});
