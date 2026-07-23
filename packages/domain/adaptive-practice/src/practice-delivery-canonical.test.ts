import { describe, it, expect } from 'vitest';
import {
  PracticeAttempt,
  PracticeResult,
  PracticeBookmark,
  WrongAnswerQueue,
  PracticeReviewQueue,
  PracticeScoringService,
  PracticeRecommendationService,
  PracticeStatisticsService,
  FeedbackStrategyFactory,
  PracticeSessionStateMachine,
} from './index';

describe('Sprint 3.5.1 Canonical Domain — PracticeScoringService', () => {
  it('calculates score, accuracy percentage, and skill breakdowns', () => {
    const scoring = new PracticeScoringService();
    const res = scoring.calculate({
      answers: [
        {
          questionId: 'q1',
          skillId: 'sk-1',
          skillName: 'Grammar',
          isCorrect: true,
          points: 10,
          timeSpentSeconds: 30,
        },
        {
          questionId: 'q2',
          skillId: 'sk-1',
          skillName: 'Grammar',
          isCorrect: false,
          points: 10,
          timeSpentSeconds: 40,
        },
        {
          questionId: 'q3',
          skillId: 'sk-2',
          skillName: 'Vocabulary',
          isCorrect: true,
          points: 10,
          timeSpentSeconds: 20,
        },
      ],
    });

    expect(res.overallScore).toBe(20);
    expect(res.maxScore).toBe(30);
    expect(res.accuracyPercentage).toBe(66.7);
    expect(res.totalTimeSeconds).toBe(90);
    expect(res.skillScores.length).toBe(2);
  });
});

describe('Sprint 3.5.1 Canonical Domain — PracticeRecommendationService & PracticeStatisticsService', () => {
  it('evaluates rule thresholds for Grammar and Reading skills', () => {
    const service = new PracticeRecommendationService();
    const res = service.evaluateRecommendations([
      { skillId: 'sk-1', skillName: 'Grammar Usage', score: 50, maxScore: 100, percentage: 50.0 },
      {
        skillId: 'sk-2',
        skillName: 'Reading Comprehension',
        score: 90,
        maxScore: 100,
        percentage: 90.0,
      },
    ]);

    expect(res.recommendations.length).toBe(1);
    expect(res.recommendations[0]).toContain('Grammar score (50%)');
    expect(res.isMockReady).toBe(false);
  });

  it('calculates practice statistics and streak metrics', () => {
    const statsService = new PracticeStatisticsService();
    const stats = statsService.calculateStats({
      completedSessionsCount: 8,
      totalAvailableSessionsCount: 10,
      scores: [80, 85, 90],
      masteredWrongAnswersCount: 4,
      totalWrongAnswersCount: 5,
      lastPracticeDate: new Date(),
    });

    expect(stats.completionPercentage).toBe(80.0);
    expect(stats.averageScore).toBe(85.0);
  });
});

describe('Sprint 3.5.1 Canonical Domain — WrongAnswerQueue & PracticeResult Aggregate', () => {
  it('tracks wrong answers and resolves entry upon reaching mastery count of 2', () => {
    const queue = new WrongAnswerQueue('waq-1', 'std-1');
    queue.addWrongAnswer('q-101', 'sk-grammar-1');

    expect(queue.activeEntries.length).toBe(1);
    expect(queue.recordMastery('q-101')).toBe(false); // 1st mastery
    expect(queue.recordMastery('q-101')).toBe(true); // 2nd mastery -> resolved!

    expect(queue.activeEntries.length).toBe(0);
  });

  it('instantiates PracticeResult and PracticeAttempt entities', () => {
    const attempt = new PracticeAttempt('att-1', 'ses-1', 'std-1', 1);
    expect(attempt.status).toBe('IN_PROGRESS');

    const result = new PracticeResult('res-1', 'ses-1', 'std-1', 85, 100, 85, 900);
    expect(result.overallScore).toBe(85);
  });
});

describe('Sprint 3.5.1 Canonical Domain — PracticeBookmark & ReviewQueue', () => {
  it('manages bookmarks and review queue ordering', () => {
    const bmk = new PracticeBookmark('bmk-1', 'std-1', 'q-101', 'GRAMMAR');
    bmk.updateNotes('Review subject-verb agreement rule');
    expect(bmk.notes).toBe('Review subject-verb agreement rule');

    const rq = new PracticeReviewQueue('prq-1', 'ses-1', 'std-1');
    rq.addItem('q-101');
    rq.addItem('q-102');

    expect(rq.unreviewedItems.length).toBe(2);
    rq.markReviewed('q-101');
    expect(rq.unreviewedItems.length).toBe(1);
  });
});

describe('Sprint 3.5.1 Canonical Domain — FeedbackStrategy & StateMachine', () => {
  it('evaluates feedback strategies', () => {
    const immediate = FeedbackStrategyFactory.getStrategy('IMMEDIATE').evaluate(
      true,
      ['opt-1'],
      'Good job',
      'les-1'
    );
    expect(immediate.isCorrect).toBe(true);
    expect(immediate.explanation).toBe('Good job');

    const deferred = FeedbackStrategyFactory.getStrategy('DEFERRED').evaluate(false, ['opt-1']);
    expect(deferred.explanation).toBeUndefined();
  });

  it('validates state machine transitions', () => {
    expect(PracticeSessionStateMachine.canTransition('LOCKED', 'AVAILABLE')).toBe(true);
    expect(PracticeSessionStateMachine.canTransition('AVAILABLE', 'STARTED')).toBe(true);
    expect(PracticeSessionStateMachine.canTransition('STARTED', 'SUBMITTED')).toBe(true);

    expect(() => PracticeSessionStateMachine.validateTransition('LOCKED', 'SUBMITTED')).toThrow(
      'Invalid practice state transition'
    );
  });
});
