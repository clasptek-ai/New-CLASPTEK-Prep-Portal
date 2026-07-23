import {
  EvaluationQueue,
  EvaluationOrchestrator,
  AIProvider,
} from '@clasptek/domain-ai-evaluation';
import { EvaluationPipeline } from '../services/EvaluationPipeline';

export interface WorkerPoolConfig {
  concurrencyLimit: number;
  providerAffinity: string[];
}

export class EvaluationWorkerPool {
  private activeWorkers = 0;
  private isRunningState = false;
  private pipeline = new EvaluationPipeline();

  constructor(
    private readonly config: WorkerPoolConfig,
    private readonly providers: AIProvider[]
  ) {}

  public start(): void {
    this.isRunningState = true;
  }

  public stop(): void {
    this.isRunningState = false;
  }

  get isRunning(): boolean {
    return this.isRunningState;
  }

  public async processQueueItem(
    queue: EvaluationQueue,
    itemId: string,
    orchestrator: EvaluationOrchestrator,
    preferredProvider?: string | undefined
  ): Promise<boolean> {
    if (this.activeWorkers >= this.config.concurrencyLimit) {
      return false;
    }

    this.activeWorkers += 1;
    try {
      const { result } = await this.pipeline.run(
        queue,
        itemId,
        orchestrator,
        this.providers,
        preferredProvider
      );
      if (!result.id) {
        throw new Error('Result contains no valid evaluation result model ID');
      }

      orchestrator.complete();
      queue.markCompleted(itemId);
      return true;
    } catch (err: any) {
      const isRetrying = orchestrator.fail(err.message || 'Worker evaluation failed');
      queue.markFailed(itemId);
      return !isRetrying;
    } finally {
      this.activeWorkers -= 1;
    }
  }
}
