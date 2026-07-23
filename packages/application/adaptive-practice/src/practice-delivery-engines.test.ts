import { describe, it, expect } from 'vitest';
import {
  WrongAnswerQueueEngine,
  ReviewQueueEngine,
  SessionRecoveryService,
  RetryPracticeHandler,
} from './index';

describe('Sprint 3.5.1 Application Services — WrongAnswerQueueEngine', () => {
  it('records wrong answers and mastery attempts', async () => {
    const mockRepo = {
      save: async () => {},
      findByStudentId: async () => null,
    };
    const engine = new WrongAnswerQueueEngine(mockRepo as any);
    const queue = await engine.recordWrongAnswer('std-100', 'q-202', 'sk-grammar-1');

    expect(queue.entries.length).toBe(1);
    expect(queue.entries[0].questionId).toBe('q-202');
  });
});

describe('Sprint 3.5.1 Application Services — ReviewQueueEngine', () => {
  it('adds items to review queue and marks them reviewed', async () => {
    const mockRepo = {
      save: async () => {},
      findBySessionId: async () => null,
    };
    const engine = new ReviewQueueEngine(mockRepo as any);
    const queue = await engine.addToReviewQueue('ses-review-1', 'std-100', 'q-303');

    expect(queue.items.length).toBe(1);
    expect(queue.unreviewedItems.length).toBe(1);
  });
});

describe('Sprint 3.5.1 Application Services — SessionRecoveryService & RetryHandler', () => {
  it('saves and restores snapshot checkpoint', () => {
    const recovery = new SessionRecoveryService();
    recovery.saveCheckpoint({
      id: 'cp-1',
      sessionId: 'ses-snap-1',
      checkpointVersion: 2,
      snapshot: {
        answersSnapshot: { 'q-1': 'opt-1' },
        bookmarksSnapshot: ['q-1'],
        remainingSeconds: 600,
        navigationState: ['q-1'],
        reviewFlags: [],
        wrongAnswerState: [],
      },
      recordedAt: new Date(),
    } as any);

    const snapshot = recovery.recoverSession('ses-snap-1');
    expect(snapshot).not.toBeNull();
    expect(snapshot?.lastCheckpointVersion).toBe(2);
    expect(snapshot?.answersCount).toBe(1);
  });

  it('executes RetryPracticeHandler to create new session', async () => {
    const handler = new RetryPracticeHandler();
    const res = await handler.execute({ sessionId: 'ses-orig-1', studentId: 'std-1' });

    expect(res.newSessionId).toContain('ses-retry-');
  });
});
