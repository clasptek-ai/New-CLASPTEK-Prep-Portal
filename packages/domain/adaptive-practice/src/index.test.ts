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
      selectionRules: [new QuestionSelectionRule({ id: 'rule-1', attributeName: 'type', operator: 'EQUALS', value: 'MCQ' })],
      targetedCompetencies: [new CompetencyCoverage({
        id: 'cov-1',
        competencyId: 'comp-1',
        coverageWeight: new SelectionWeight(1.0),
        targetPercentage: new CoveragePercentage(100),
      })],
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
    session.addQuestion(new PracticeQuestion({
      id: 'pq-1',
      questionVersionId: 'qv-1',
      orderIndex: 0,
      status: 'PENDING',
      accuracy: undefined,
      timeSpentMs: undefined,
    }));

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
    session.addQuestion(new PracticeQuestion({
      id: 'pq-1',
      questionVersionId: 'qv-1',
      orderIndex: 0,
      status: 'PENDING',
      accuracy: undefined,
      timeSpentMs: undefined,
    }));

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
    session.addQuestion(new PracticeQuestion({
      id: 'pq-1',
      questionVersionId: 'qv-1',
      orderIndex: 0,
      status: 'PENDING',
      accuracy: undefined,
      timeSpentMs: undefined,
    }));

    session.start(new Date());
    expect(session.status).toBe('ACTIVE');

    session.recordSkip('qv-1');
    expect(session.questions[0].status).toBe('SKIPPED');
    expect(session.questions[0].accuracy).toBe(0);
  });

  it('adjusts difficulty profile', () => {
    const session = mkSession();
    session.adjustDifficulty('Beginner', 'Intermediate', 0.9);
    expect(session.difficultyProfile.minLevel).toBe('Intermediate');
  });
});
