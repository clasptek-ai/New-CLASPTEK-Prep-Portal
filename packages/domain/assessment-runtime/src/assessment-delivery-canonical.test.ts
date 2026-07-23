import { describe, it, expect } from 'vitest';
import {
  AssessmentAttempt,
  AssessmentResult,
  AssessmentScoringService,
  AssessmentTimerEvaluationPolicy,
  AssessmentSessionStateMachine,
  ResultVisibilityFactory,
  AssessmentEligibilitySpecification,
  SubmissionSpecification,
  ResumeSpecification,
  TimerSpecification,
} from './index';

describe('Sprint 3.4.1 Canonical Domain — AssessmentScoringService', () => {
  it('scores objective student answers and produces section and skill breakdowns', () => {
    const service = new AssessmentScoringService();
    const result = service.score({
      studentAnswers: [
        {
          questionId: 'q1',
          sectionCode: 'READING',
          skillId: 'sk-r1',
          skillName: 'Main Idea',
          selectedOptionIds: ['opt-1'],
          correctOptionIds: ['opt-1'],
          points: 10,
        },
        {
          questionId: 'q2',
          sectionCode: 'READING',
          skillId: 'sk-r1',
          skillName: 'Main Idea',
          selectedOptionIds: ['opt-2'],
          correctOptionIds: ['opt-1'],
          points: 10,
        },
        {
          questionId: 'q3',
          sectionCode: 'LISTENING',
          skillId: 'sk-l1',
          skillName: 'Inference',
          selectedOptionIds: ['opt-3'],
          correctOptionIds: ['opt-3'],
          points: 10,
        },
      ],
      passThresholdPercentage: 60.0,
    });

    expect(result.overallScore).toBe(20);
    expect(result.maxScore).toBe(30);
    expect(result.percentage).toBe(66.7);
    expect(result.isPassed).toBe(true);

    expect(result.sectionScores.length).toBe(2);
    expect(result.skillScores.length).toBe(2);
  });
});

describe('Sprint 3.4.1 Canonical Domain — AssessmentTimerEvaluationPolicy', () => {
  it('evaluates remaining time and drift tolerance', () => {
    const policy = new AssessmentTimerEvaluationPolicy();
    const res = policy.evaluateTimer({
      allocatedSeconds: 3600,
      elapsedSeconds: 1800,
      driftSeconds: 5,
      maxDriftToleranceSeconds: 10,
    });

    expect(res.remainingSeconds).toBe(1795);
    expect(res.isExpired).toBe(false);
    expect(res.isDriftExceeded).toBe(false);
  });

  it('detects exceeded drift tolerance', () => {
    const policy = new AssessmentTimerEvaluationPolicy();
    const res = policy.evaluateTimer({
      allocatedSeconds: 3600,
      elapsedSeconds: 1800,
      driftSeconds: 25,
      maxDriftToleranceSeconds: 10,
    });

    expect(res.isDriftExceeded).toBe(true);
  });
});

describe('Sprint 3.4.1 Canonical Domain — AssessmentSessionStateMachine', () => {
  it('validates allowed session state transitions', () => {
    expect(AssessmentSessionStateMachine.canTransition('CREATED', 'STARTED')).toBe(true);
    expect(AssessmentSessionStateMachine.canTransition('STARTED', 'PAUSED')).toBe(true);
    expect(AssessmentSessionStateMachine.canTransition('PAUSED', 'RESUMED')).toBe(true);
    expect(AssessmentSessionStateMachine.canTransition('RESUMED', 'SUBMITTED')).toBe(true);

    expect(() => AssessmentSessionStateMachine.validateTransition('CREATED', 'SUBMITTED')).toThrow(
      'Invalid session state transition'
    );
  });
});

describe('Sprint 3.4.1 Canonical Domain — ResultVisibilityStrategy', () => {
  it('applies visibility filters based on selected strategy', () => {
    const mockResult = new AssessmentResult('res-1', 'ses-1', 'std-1', 85, 100, true, 'SCORE_ONLY');

    const scoreOnlyView = ResultVisibilityFactory.getStrategy('SCORE_ONLY').apply(mockResult);
    expect(scoreOnlyView.overallScore).toBe(85);
    expect(scoreOnlyView.sectionScores).toBeUndefined();

    const fullReviewView = ResultVisibilityFactory.getStrategy('FULL_REVIEW').apply(mockResult);
    expect(fullReviewView.fullReviewAvailable).toBe(true);
  });
});

describe('Sprint 3.4.1 Canonical Domain — Specifications & Entities', () => {
  it('validates eligibility, resume, and submission specifications', () => {
    const attempt = new AssessmentAttempt('att-1', 'ses-1', 'std-1', 1);
    expect(attempt.status).toBe('IN_PROGRESS');

    const eligSpec = new AssessmentEligibilitySpecification(3, 2);
    expect(eligSpec.isSatisfiedBy({ status: 'ACTIVE' } as any)).toBe(true);

    const subSpec = new SubmissionSpecification();
    expect(subSpec.isSatisfiedBy({ status: 'ACTIVE' } as any)).toBe(true);

    const resSpec = new ResumeSpecification(5);
    expect(resSpec.isSatisfiedBy({ status: 'PAUSED' } as any)).toBe(true);

    const timerSpec = new TimerSpecification(10);
    expect(timerSpec.isSatisfiedBy(5)).toBe(true);
    expect(timerSpec.isSatisfiedBy(15)).toBe(false);
  });
});
