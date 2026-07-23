import { describe, it, expect } from 'vitest';
import {
  EvaluationOrchestrator,
  EvaluationBudget,
  EvaluationQueue,
  ProviderSelectionService,
  EvaluationSlaPolicy,
  ProviderCapabilityStrategyFactory,
  RetryPolicy,
  FailureEscalationPolicy,
  NotificationStrategyFactory,
  MockAIProvider,
} from './index';

describe('Sprint 3.7 Canonical Domain — EvaluationOrchestrator & Budget', () => {
  it('manages orchestration lifecycle and escalations', () => {
    const orchestrator = new EvaluationOrchestrator({ id: 'orch-1' });
    expect(orchestrator.status).toBe('QUEUED');

    orchestrator.dispatch();
    expect(orchestrator.status).toBe('RUNNING');

    const canRetry = orchestrator.fail('Provider rate limit exceeded');
    expect(canRetry).toBe(true);
    expect(orchestrator.status).toBe('FAILED');
    expect(orchestrator.attempts).toBe(1);

    orchestrator.dispatch();
    const canRetryAgain = orchestrator.fail('Timeout'); // 2nd attempt failed
    expect(canRetryAgain).toBe(true);

    orchestrator.dispatch();
    const canRetryFinal = orchestrator.fail('Third failure'); // 3rd attempt failed -> limit reached
    expect(canRetryFinal).toBe(false);
    expect(orchestrator.status).toBe('NEEDS_REVIEW');
  });

  it('enforces budgets and tracks spend', () => {
    const budget = new EvaluationBudget({
      id: 'bdg-1',
      dailyLimit: 100.0,
      monthlyLimit: 1000.0,
    });
    expect(budget.isDailyExceeded).toBe(false);

    budget.recordSpend(105.0);
    expect(budget.isDailyExceeded).toBe(true);
    expect(budget.dailySpend).toBe(105.0);

    budget.resetDaily();
    expect(budget.isDailyExceeded).toBe(false);
  });
});

describe('Sprint 3.7 Canonical Domain — EvaluationQueue & SLA Policy', () => {
  it('enqueues, dequeues, and DLQs items', () => {
    const queue = new EvaluationQueue('queue-1', []);
    const item = queue.enqueue('job-1', 'std-1', 1, 'MOCK');

    expect(queue.items.length).toBe(1);
    expect(item.status).toBe('QUEUED');

    queue.dequeue(item.id);
    expect(queue.items[0].status).toBe('RUNNING');

    const keepsRetrying = queue.markFailed(item.id, 2); // retry count = 1
    expect(keepsRetrying).toBe(true);

    const keepsRetrying2 = queue.markFailed(item.id, 2); // retry count = 2 -> DLQ
    expect(keepsRetrying2).toBe(false);
    expect(queue.items[0].status).toBe('DLQ');
  });

  it('evaluates SLA target compliance', () => {
    const policy = new EvaluationSlaPolicy();
    const breachWriting = policy.evaluateSla('WRITING', 150); // SLA target: 120s
    expect(breachWriting.isBreached).toBe(true);
    expect(breachWriting.severity).toBe('MEDIUM');

    const breachSpeaking = policy.evaluateSla('SPEAKING', 100); // SLA target: 180s
    expect(breachSpeaking.isBreached).toBe(false);
    expect(breachSpeaking.severity).toBe('LOW');
  });
});

describe('Sprint 3.7 Canonical Domain — Strategies & Provider Selection', () => {
  it('resolves capabilities strategy', () => {
    const openai = ProviderCapabilityStrategyFactory.getStrategy('OPENAI');
    expect(openai.getCapabilities().supportsVision).toBe(true);
    expect(openai.getCapabilities().tokenLimit).toBe(128000);

    const gemini = ProviderCapabilityStrategyFactory.getStrategy('GEMINI');
    expect(gemini.getCapabilities().supportsAudio).toBe(true);
  });

  it('chooses the best provider based on registry', () => {
    const selection = new ProviderSelectionService();
    const mockProvider = new MockAIProvider();
    const chosen = selection.selectBestProvider([mockProvider], 'MOCK');
    expect(chosen.provider).toBe('MOCK');
  });

  it('runs retry strategy backoff calculations', () => {
    const policy = new RetryPolicy(3, 5, 2.0);
    expect(policy.calculateDelay(1)).toBe(5);
    expect(policy.calculateDelay(2)).toBe(10);
    expect(policy.calculateDelay(3)).toBe(20);
  });

  it('routes failed job to human review escalation', () => {
    const policy = new FailureEscalationPolicy();
    expect(policy.determineEscalation(1, 3)).toBe('RETRY');
    expect(policy.determineEscalation(3, 3)).toBe('HUMAN_REVIEW');
  });

  it('loads notification strategies', () => {
    const strats = NotificationStrategyFactory.getStrategies();
    expect(strats.length).toBe(4);
  });
});
