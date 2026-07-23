import { describe, it, expect } from 'vitest';
import {
  PracticeSessionId,
  MasteryThreshold,
  AdaptiveConfidence,
  SpacingPolicy,
  RecommendationPriority,
  PracticeRecommendation,
  PracticePlan,
  PracticeSession,
  PracticeQuestion,
  PracticeConfiguration,
  DifficultyProfile,
  SessionMode,
  PracticeDuration,
  QuestionSelectionRule,
  CompetencyCoverage,
  SelectionWeight,
  CoveragePercentage,
  PracticeFeedback,
} from './index';

describe('Adaptive Practice Value Objects', () => {
  it('validates PracticeSessionId', () => {
    expect(new PracticeSessionId('id-1').value).toBe('id-1');
    expect(() => new PracticeSessionId('')).toThrow();
  });

  it('validates MasteryThreshold', () => {
    expect(new MasteryThreshold(85).value).toBe(85);
    expect(() => new MasteryThreshold(-5)).toThrow();
    expect(() => new MasteryThreshold(105)).toThrow();
  });

  it('validates AdaptiveConfidence range', () => {
    expect(new AdaptiveConfidence(0.95).value).toBe(0.95);
    expect(() => new AdaptiveConfidence(-0.1)).toThrow();
    expect(() => new AdaptiveConfidence(1.05)).toThrow();
  });

  it('validates SpacingPolicy', () => {
    const policy = new SpacingPolicy(24, 1.5, 168);
    expect(policy.reviewIntervalHours).toBe(24);
    expect(policy.expansionFactor).toBe(1.5);
    expect(policy.maxIntervalHours).toBe(168);
    expect(() => new SpacingPolicy(-24, 1.5, 168)).toThrow();
  });

  it('validates RecommendationPriority', () => {
    const priority = new RecommendationPriority('HIGH', 2.5);
    expect(priority.priority).toBe('HIGH');
    expect(priority.weight).toBe(2.5);
    expect(() => new RecommendationPriority('CRITICAL', -1)).toThrow();
  });
});

describe('PracticeRecommendation Aggregate', () => {
  const mkRecommendation = () => {
    return new PracticeRecommendation({
      id: 'rec-1',
      studentId: 'student-1',
      recommendationRules: {},
      recommendationSource: 'AI_GENERATED',
      priority: new RecommendationPriority('MEDIUM', 1.0),
      status: 'PENDING',
      inputSnapshot: {},
      algorithmVersion: '1.0.0',
      decisionTrace: {},
      outputPayload: {},
    });
  };

  it('accepts pending recommendation', () => {
    const rec = mkRecommendation();
    rec.accept('plan-1');
    expect(rec.status).toBe('ACCEPTED');
    expect(rec.domainEvents).toHaveLength(1);
    expect((rec.domainEvents[0] as any).eventName).toBe('RecommendationAccepted');
  });

  it('rejects pending recommendation', () => {
    const rec = mkRecommendation();
    rec.reject();
    expect(rec.status).toBe('REJECTED');
    expect(rec.domainEvents).toHaveLength(1);
    expect((rec.domainEvents[0] as any).eventName).toBe('RecommendationRejected');
  });

  it('expires pending recommendation', () => {
    const rec = mkRecommendation();
    rec.expire();
    expect(rec.status).toBe('EXPIRED');
  });

  it('fails if non-pending is updated', () => {
    const rec = mkRecommendation();
    rec.reject();
    expect(() => rec.accept('plan-1')).toThrow();
  });
});

describe('PracticePlan Aggregate', () => {
  const mkPlan = () => {
    return new PracticePlan({
      id: 'plan-1',
      studentId: 'student-1',
      recommendationId: 'rec-1',
      title: 'Plan Title',
      status: 'DRAFT',
      selectionRules: [
        new QuestionSelectionRule({
          id: 'rule-1',
          attributeName: 'type',
          operator: 'EQUALS',
          value: 'MCQ',
        }),
      ],
      targetedCompetencies: [
        new CompetencyCoverage({
          id: 'cov-1',
          competencyId: 'comp-1',
          coverageWeight: new SelectionWeight(1.0),
          targetPercentage: new CoveragePercentage(100),
        }),
      ],
      spacingPolicy: new SpacingPolicy(12, 1.2, 72),
    });
  };

  it('generates a draft plan', () => {
    const plan = mkPlan();
    plan.generate();
    expect(plan.status).toBe('GENERATED');
    expect(plan.domainEvents).toHaveLength(1);
  });

  it('schedules a generated plan', () => {
    const plan = mkPlan();
    plan.generate();
    plan.schedule();
    expect(plan.status).toBe('SCHEDULED');
  });

  it('discards plan', () => {
    const plan = mkPlan();
    plan.discard();
    expect(plan.status).toBe('DISCARDED');
  });
});

describe('PracticeSession Aggregate', () => {
  const mkSession = () => {
    return new PracticeSession({
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
      startedAt: new Date(),
    });
  };

  it('starts and completes a practice session', () => {
    const session = mkSession();
    session.addQuestion(
      new PracticeQuestion({
        id: 'pq-1',
        questionVersionId: 'qv-1',
        orderIndex: 0,
        status: 'PENDING',
        accuracy: undefined,
        timeSpentMs: undefined,
      })
    );

    session.start(new Date());
    expect(session.status).toBe('ACTIVE');

    session.recordResponse('qv-1', 100, 15000);
    expect(session.questions[0].status).toBe('COMPLETED');
    expect(session.questions[0].accuracy).toBe(100);

    const feedback = new PracticeFeedback({
      id: 'fb-1',
      rating: 5,
      difficultyPerception: 'JUST_RIGHT',
      confidence: 'HIGH',
      satisfaction: 'VERY_SATISFIED',
      usefulness: 'HIGHLY_USEFUL',
      technicalIssue: false,
      recommendationQuality: 'EXCELLENT',
      comment: 'Great session!',
    });

    session.complete(new Date(), feedback);
    expect(session.status).toBe('COMPLETED');
    expect(session.feedback?.rating).toBe(5);
  });

  it('pauses and resumes a session', () => {
    const session = mkSession();
    session.addQuestion(
      new PracticeQuestion({
        id: 'pq-1',
        questionVersionId: 'qv-1',
        orderIndex: 0,
        status: 'PENDING',
        accuracy: undefined,
        timeSpentMs: undefined,
      })
    );

    session.start(new Date());
    expect(session.status).toBe('ACTIVE');

    session.pause(new Date());
    expect(session.status).toBe('PAUSED');
    expect(session.checkpoint?.questionIndex).toBe(0);

    session.resume();
    expect(session.status).toBe('ACTIVE');
  });

  it('supports skipping questions', () => {
    const session = mkSession();
    session.addQuestion(
      new PracticeQuestion({
        id: 'pq-1',
        questionVersionId: 'qv-1',
        orderIndex: 0,
        status: 'PENDING',
        accuracy: undefined,
        timeSpentMs: undefined,
      })
    );

    session.start(new Date());
    expect(session.status).toBe('ACTIVE');

    session.recordSkip('qv-1');
    expect(session.questions[0].status).toBe('SKIPPED');
    const e = session.domainEvents.find((ev: any) => ev.eventName === 'QuestionSkipped');
    expect(e).toBeDefined();
  });

  it('adjusts difficulty profile', () => {
    const session = mkSession();
    session.adjustDifficulty('Beginner', 'Intermediate', 0.9);
    expect(session.difficultyProfile.minLevel).toBe('Intermediate');
  });
});

// ─────────────────────────────────────────────────────────────────
// Sprint 2.6 Addendum Domain Unit Tests
// ─────────────────────────────────────────────────────────────────

import {
  ConfidenceLevel,
  ConfidenceScore,
  RetentionProfile,
  StudentMotivation,
  PracticeGoalEngine,
  KnowledgeRetentionEngine,
  AdaptiveDifficultyEngine,
  TimePerformanceAnalyzer,
  FocusAreaEngine,
  AdaptiveDailyGoalEngine,
  MotivationEngine,
} from './index';

describe('Sprint 2.6 Addendum Domain Engines & VOs', () => {
  it('creates ConfidenceLevel and ConfidenceScore VOs', () => {
    const cl = new ConfidenceLevel('HIGH');
    expect(cl.level).toBe('HIGH');
    expect(cl.numericScore).toBe(0.75);

    const cs = new ConfidenceScore(0.85);
    expect(cs.value).toBe(0.85);
  });

  it('evaluates PracticeGoalEngine recommendation', () => {
    const goal = PracticeGoalEngine.recommendGoal('s-1', 'Grammar');
    expect(goal.goalType).toBe('IMPROVE_GRAMMAR_ACCURACY');
    expect(goal.targetValue).toBe(85);
  });

  it('calculates KnowledgeRetentionEngine decay & RetentionProfile review', () => {
    const kre = new KnowledgeRetentionEngine();
    const decay = kre.calculateDecay(new Date(Date.now() - 48 * 3600 * 1000), 24);
    expect(decay).toBeLessThan(100);

    const profile = new RetentionProfile({
      id: 'rp-1',
      studentId: 's-1',
      competencyId: 'comp-grammar',
      retentionScore: 80,
      reviewInterval: 24,
    });
    profile.recordReview(true);
    expect(profile.retentionScore).toBe(95);
    expect(profile.reviewInterval).toBe(43);
  });

  it('evaluates AdaptiveDifficultyEngine dynamic output', () => {
    const engine = new AdaptiveDifficultyEngine();
    const diff = engine.calculate({
      accuracy: 95,
      responseTimeMs: 12000,
      hintUsage: 0,
      confidence: 'EXPERT',
      currentStreak: 5,
      mastery: 90,
      recentPerformance: 'IMPROVING',
    });
    expect(diff).toBe('Expert');
  });

  it('analyzes TimePerformanceAnalyzer metrics', () => {
    const analyzer = new TimePerformanceAnalyzer();
    const res = analyzer.analyze([
      { questionId: 'q1', skillId: 'grammar', timeSpentMs: 30000, wordCount: 50 },
      { questionId: 'q2', skillId: 'reading', timeSpentMs: 60000, wordCount: 150 },
    ]);
    expect(res.averageResponseTimeMs).toBe(45000);
    expect(res.readingSpeedWpm).toBeGreaterThan(0);
    expect(res.timePerSkillMs['grammar']).toBe(30000);
  });

  it('recommends FocusArea via FocusAreaEngine', () => {
    const engine = new FocusAreaEngine();
    const area = engine.recommendFocusArea({
      grammarAccuracy: 60,
      readingSpeedWpm: 180,
      vocabularyScore: 80,
    });
    expect(area).toBe('Grammar');
  });

  it('generates AdaptiveDailyGoal via AdaptiveDailyGoalEngine', () => {
    const engine = new AdaptiveDailyGoalEngine();
    const dailyGoal = engine.generateDailyGoal('s-1', {
      learningPace: 'Accelerated',
      mastery: 50,
      missedDays: 1,
      readinessScore: 65,
    });
    expect(dailyGoal.targetQuestions).toBe(30);
    expect(dailyGoal.timedPracticeRequired).toBe(true);
  });

  it('calculates MotivationEngine rewards & updates StudentMotivation', () => {
    const engine = new MotivationEngine();
    const reward = engine.calculateReward(85, 15000, 7);
    expect(reward.xp).toBe(100);
    expect(reward.badgeUnlocked).toBe('7-Day Practice Streak');

    const motivation = new StudentMotivation({ id: 'm-1', studentId: 's-1' });
    motivation.addActivity(reward.points, reward.xp);
    expect(motivation.xp).toBe(100);
    expect(motivation.dailyStreak).toBe(1);
  });
});
