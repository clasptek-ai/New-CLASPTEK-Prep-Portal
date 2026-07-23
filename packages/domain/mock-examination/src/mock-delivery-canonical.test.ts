import { describe, it, expect } from 'vitest';
import {
  MockSection,
  MockCheckpoint,
  SubjectiveEvaluationQueue,
  IntegrityDetectionService,
  IntegrityEnforcementService,
  MockTimingService,
  SubmissionStrategyFactory,
  NavigationPolicyFactory,
  ResultVisibilityStrategyFactory,
  MockSessionDeliveryStateMachine,
} from './index';

describe('Sprint 3.6 Canonical Domain — MockSection Aggregate', () => {
  it('manages section lifecycle transitions', () => {
    const sec = new MockSection({
      id: 'sec-1',
      templateId: 'tmpl-1',
      sectionName: 'Listening',
      orderIndex: 0,
      durationMinutes: 30,
    });
    expect(sec.status).toBe('LOCKED');

    sec.unlock();
    expect(sec.status).toBe('UNLOCKED');

    sec.start();
    expect(sec.status).toBe('STARTED');

    sec.complete();
    expect(sec.status).toBe('COMPLETED');
    expect(() => sec.unlock()).toThrow('Completed section is locked and cannot be unlocked');
  });
});

describe('Sprint 3.6 Canonical Domain — MockCheckpoint & SubjectiveEvaluationQueue', () => {
  it('creates MockCheckpoint snapshot', () => {
    const cp = MockCheckpoint.createSnapshot('ses-1', 'std-1', 1, {
      answers: { q1: 'A' },
      timeRemainingSeconds: 1200,
      currentSectionIndex: 0,
      flaggedQuestions: ['q1'],
      warningCount: 0,
    });
    expect(cp.checkpointVersion).toBe(1);
    expect(cp.snapshot.answers.q1).toBe('A');
  });

  it('enqueues and assigns subjective queue items', () => {
    const queue = new SubjectiveEvaluationQueue('seq-1', []);
    queue.enqueueItem('ses-1', 'std-1', 'q-writing-1', 'WRITING', { essay: 'Sample text' });

    expect(queue.pendingItems.length).toBe(1);

    const item = queue.items[0];
    queue.assignEvaluator(item.id, 'eval-100');
    expect(queue.items[0].status).toBe('ASSIGNED');
  });
});

describe('Sprint 3.6 Canonical Domain — Integrity Detection & Enforcement Services', () => {
  it('detects violations and enforces auto-lock threshold', () => {
    const detection = new IntegrityDetectionService();
    const result = detection.detectEvent('FULLSCREEN_EXITED');
    expect(result.type).toBe('FULLSCREEN_EXITED');

    const enforcement = new IntegrityEnforcementService(3);
    const outcome1 = enforcement.processViolation(0, result);
    expect(outcome1.shouldLock).toBe(false);
    expect(outcome1.warningCount).toBe(1);

    const outcome3 = enforcement.processViolation(2, result);
    expect(outcome3.shouldLock).toBe(true);
    expect(outcome3.actionTaken).toBe('LOCK');
  });
});

describe('Sprint 3.6 Canonical Domain — MockTimingService & Strategies', () => {
  it('calculates remaining time and overtime', () => {
    const timing = new MockTimingService();
    const now = new Date();
    expect(timing.calculateRemainingSeconds(now, 30)).toBe(1800);
    expect(timing.isExpired(now, 30)).toBe(false);
  });

  it('evaluates submission, navigation, and result visibility strategies', () => {
    const subStrat = SubmissionStrategyFactory.getStrategy('MIXED');
    const subRes = subStrat.processSubmission({
      sessionId: 'ses-1',
      studentId: 'std-1',
      answers: [{ questionId: 'q1', sectionType: 'WRITING', payload: {} }],
    });
    expect(subRes.queuedSubjectiveItemsCount).toBe(1);

    const navPol = NavigationPolicyFactory.getPolicy('LOCK_ON_COMPLETE');
    expect(
      navPol.canNavigate({
        currentIndex: 1,
        targetIndex: 0,
        totalSections: 2,
        isCurrentSectionCompleted: true,
      })
    ).toBe(false);

    const visStrat = ResultVisibilityStrategyFactory.getStrategy('OBJECTIVE_ONLY');
    const visRes = visStrat.evaluateVisibility(true);
    expect(visRes.showObjectiveScores).toBe(true);
    expect(visRes.showSubjectiveScores).toBe(false);
  });

  it('validates state machine transitions', () => {
    expect(MockSessionDeliveryStateMachine.canTransition('AVAILABLE', 'UNLOCKED')).toBe(true);
    expect(MockSessionDeliveryStateMachine.canTransition('UNLOCKED', 'STARTED')).toBe(true);
    expect(() =>
      MockSessionDeliveryStateMachine.validateTransition('AVAILABLE', 'COMPLETED')
    ).toThrow('Invalid mock delivery state transition');
  });
});
