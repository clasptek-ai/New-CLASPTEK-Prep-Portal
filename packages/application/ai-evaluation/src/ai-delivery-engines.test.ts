import { describe, it, expect } from 'vitest';
import {
  EvaluationWorkerPool,
  EnqueueJobHandler,
  RetryJobHandler,
  LogProviderHeartbeatHandler,
  EvaluationPipeline,
} from './index';
import {
  EvaluationQueue,
  EvaluationOrchestrator,
  MockAIProvider,
} from '@clasptek/domain-ai-evaluation';

describe('Sprint 3.7 Application Services — Worker Pool', () => {
  it('manages worker lifecycle and processes queued jobs', async () => {
    const mockProvider = new MockAIProvider();
    const pool = new EvaluationWorkerPool({ concurrencyLimit: 2, providerAffinity: ['MOCK'] }, [
      mockProvider,
    ]);

    pool.start();
    expect(pool.isRunning).toBe(true);

    const queue = new EvaluationQueue('queue-1', []);
    const item = queue.enqueue('job-1', 'std-1', 1, 'MOCK');
    const orchestrator = new EvaluationOrchestrator({ id: 'orch-1' });

    const processed = await pool.processQueueItem(queue, item.id, orchestrator, 'MOCK');
    expect(processed).toBe(true);
    expect(orchestrator.status).toBe('COMPLETED');

    pool.stop();
    expect(pool.isRunning).toBe(false);
  });
});

describe('Sprint 3.7 Application Services — Handlers', () => {
  it('enqueues job successfully', async () => {
    const mockRepo = {
      saveQueue: async () => {},
      findQueue: async () => null,
    };
    const handler = new EnqueueJobHandler(mockRepo as any);
    const itemId = await handler.execute({
      jobId: 'job-1',
      studentId: 'std-1',
      priority: 5,
      source: 'PRACTICE',
    });
    expect(itemId).toContain('qi-job-1');
  });

  it('handles manual retry trigger', async () => {
    const mockQueue = new EvaluationQueue('global-queue', []);
    mockQueue.enqueue('job-101', 'std-1', 5, 'PRACTICE');
    const mockRepo = {
      saveQueue: async () => {},
      findQueue: async () => mockQueue,
    };
    const handler = new RetryJobHandler(mockRepo as any);
    const isRetried = await handler.execute({
      jobId: 'job-101',
      itemId: 'qi-job-101',
    });
    expect(isRetried).toBe(true);
  });

  it('logs provider heartbeat status', async () => {
    const mockProvider = new MockAIProvider();
    const mockRepo = {
      saveHealth: async () => {},
    };
    const handler = new LogProviderHeartbeatHandler([mockProvider], mockRepo as any);
    const success = await handler.execute({
      providerCode: 'MOCK',
      latencyMs: 45,
      isHealthy: true,
    });
    expect(success).toBe(true);
  });

  it('runs the full evaluation pipeline and returns result & telemetry', async () => {
    const pipeline = new EvaluationPipeline();
    const mockProvider = new MockAIProvider();
    const queue = new EvaluationQueue('queue-1', []);
    const item = queue.enqueue('job-1', 'std-1', 1, 'MOCK');
    const orchestrator = new EvaluationOrchestrator({ id: 'orch-1' });

    const { result, telemetry } = await pipeline.run(
      queue,
      item.id,
      orchestrator,
      [mockProvider],
      'MOCK'
    );
    expect(result.rawScore).toBe(7.0);
    expect(telemetry.status).toBe('SUCCESS');
    expect(telemetry.provider).toBe('MOCK');
  });
});
