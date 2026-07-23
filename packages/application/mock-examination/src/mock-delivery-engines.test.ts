import { describe, it, expect } from 'vitest';
import {
  CheckpointEngine,
  SubmissionOrchestrationEngine,
  ProcessIntegrityEventHandler,
} from './index';

describe('Sprint 3.6 Application Services — CheckpointEngine', () => {
  it('saves and restores checkpoint snapshots', async () => {
    const mockRepo = {
      save: async () => {},
      findLatestBySessionId: async () => null,
    };
    const engine = new CheckpointEngine(mockRepo as any);
    const cp = await engine.saveCheckpoint('ses-1', 'std-1', 1, { answers: { q1: 'A' } });

    expect(cp.sessionId).toBe('ses-1');
    expect(cp.checkpointVersion).toBe(1);
  });
});

describe('Sprint 3.6 Application Services — SubmissionOrchestrationEngine', () => {
  it('orchestrates mixed submission and enqueues subjective items', async () => {
    const mockRepo = {
      saveQueue: async () => {},
      findQueueBySessionId: async () => null,
    };
    const engine = new SubmissionOrchestrationEngine(mockRepo as any);
    const { result, queue } = await engine.orchestrateSubmission(
      {
        sessionId: 'ses-100',
        studentId: 'std-100',
        answers: [
          { questionId: 'q-mcq', sectionType: 'READING', payload: 'A' },
          { questionId: 'q-essay', sectionType: 'WRITING', payload: 'My Essay' },
        ],
      },
      'MIXED'
    );

    expect(result.queuedSubjectiveItemsCount).toBe(1);
    expect(queue.items.length).toBe(1);
    expect(queue.items[0].questionId).toBe('q-essay');
  });
});

describe('Sprint 3.6 Application Services — ProcessIntegrityEventHandler', () => {
  it('executes integrity event processing command', async () => {
    const handler = new ProcessIntegrityEventHandler();
    const outcome = await handler.execute({
      sessionId: 'ses-200',
      studentId: 'std-200',
      eventType: 'TAB_SWITCHED',
      currentWarningCount: 2,
    });

    expect(outcome.warningCount).toBe(3);
    expect(outcome.shouldLock).toBe(true);
    expect(outcome.actionTaken).toBe('LOCK');
  });
});
