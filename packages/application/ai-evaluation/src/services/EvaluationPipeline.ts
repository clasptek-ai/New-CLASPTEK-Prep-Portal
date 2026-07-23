import {
  EvaluationQueue,
  EvaluationOrchestrator,
  AIProvider,
  ProviderSelectionService,
  NotificationStrategyFactory,
  NotificationPayload,
  EvaluationExecutionContext,
  ProviderTelemetry,
  EvaluationResult,
} from '@clasptek/domain-ai-evaluation';
import { PromptBuilderService } from './PromptBuilderService';

export class EvaluationPipeline {
  private promptBuilder = new PromptBuilderService();

  public async run(
    queue: EvaluationQueue,
    itemId: string,
    orchestrator: EvaluationOrchestrator,
    providers: AIProvider[],
    preferredProvider?: string | undefined
  ): Promise<{ result: EvaluationResult; telemetry: ProviderTelemetry }> {
    const startMs = Date.now();

    // Dequeue queue item and dispatch orchestrator to RUNNING state
    queue.dequeue(itemId);
    orchestrator.dispatch();

    // 1. Select Provider
    const selector = new ProviderSelectionService();
    const provider = selector.selectBestProvider(providers, preferredProvider);

    // 2. Build Prompt
    const compiled = this.promptBuilder.buildPrompt(
      'Grade student text against IELTS band descriptors.',
      'Student essay content draft details.',
      {}
    );

    // 3. Setup Context
    const executionContext: EvaluationExecutionContext = {
      provider: provider.provider,
      model: 'gemini-1.5-pro',
      prompt: compiled.userPrompt,
      timeout: 30000,
      temperature: 0.2,
      maxTokens: 2048,
      rubric: {},
      studentId: 'std-100',
      submissionId: 'sub-100',
      jobId: orchestrator.id,
      retryAttempt: orchestrator.attempts,
      evaluationType: 'WRITING',
    };

    try {
      // 4. Execute & Validate & Map (all handled inside provider boundary)
      const result = await provider.evaluateWriting(executionContext);

      const costEstimate = provider.estimateCost(100, 200);
      const telemetry: ProviderTelemetry = {
        latencyMs: Date.now() - startMs,
        provider: provider.provider,
        model: executionContext.model,
        inputTokens: costEstimate.inputTokens,
        outputTokens: costEstimate.outputTokens,
        costUsd: costEstimate.costUsd,
        attempts: orchestrator.attempts,
        status: 'SUCCESS',
      };

      // 5. Notify
      const payload: NotificationPayload = {
        studentId: 'std-100',
        jobId: orchestrator.id,
        status: 'COMPLETED',
        message: `Evaluation completed successfully using ${provider.name}.`,
      };
      const strategies = NotificationStrategyFactory.getStrategies();
      for (const strat of strategies) {
        await strat.send(payload);
      }

      return { result, telemetry };
    } catch (err: any) {
      const telemetry: ProviderTelemetry = {
        latencyMs: Date.now() - startMs,
        provider: provider.provider,
        model: executionContext.model,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        attempts: orchestrator.attempts,
        status: 'FAILED',
      };
      if (err) {
        err.telemetry = telemetry;
      }
      throw err;
    }
  }
}
