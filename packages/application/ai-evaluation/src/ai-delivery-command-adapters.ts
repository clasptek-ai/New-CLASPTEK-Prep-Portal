import {
  EvaluationQueue,
  AIProvider,
  AIProviderHealthRepositoryContract,
  EvaluationQueueRepositoryContract,
} from '@clasptek/domain-ai-evaluation';

export interface EnqueueJobCommand {
  jobId: string;
  studentId: string;
  priority: number;
  source: 'ASSESSMENT' | 'PRACTICE' | 'MOCK';
}

export class EnqueueJobHandler {
  constructor(private readonly queueRepo?: EvaluationQueueRepositoryContract) {}

  public async execute(cmd: EnqueueJobCommand): Promise<string> {
    let queue = this.queueRepo ? await this.queueRepo.findQueue() : null;
    if (!queue) {
      queue = new EvaluationQueue('global-queue', []);
    }
    const item = queue.enqueue(cmd.jobId, cmd.studentId, cmd.priority, cmd.source);
    if (this.queueRepo) {
      await this.queueRepo.saveQueue(queue);
    }
    return item.id;
  }
}

export interface RetryJobCommand {
  jobId: string;
  itemId: string;
}

export class RetryJobHandler {
  constructor(private readonly queueRepo?: EvaluationQueueRepositoryContract) {}

  public async execute(cmd: RetryJobCommand): Promise<boolean> {
    const queue = this.queueRepo ? await this.queueRepo.findQueue() : null;
    if (!queue) return false;

    const isRetried = queue.markFailed(cmd.itemId);
    if (this.queueRepo) {
      await this.queueRepo.saveQueue(queue);
    }
    return isRetried;
  }
}

export interface LogProviderHeartbeatCommand {
  providerCode: string;
  latencyMs: number;
  isHealthy: boolean;
}

export class LogProviderHeartbeatHandler {
  constructor(
    private readonly providers: AIProvider[],
    private readonly healthRepo?: AIProviderHealthRepositoryContract
  ) {}

  public async execute(cmd: LogProviderHeartbeatCommand): Promise<boolean> {
    const provider = this.providers.find(
      (p) => p.provider.toUpperCase() === cmd.providerCode.toUpperCase()
    );
    if (!provider) return false;

    const status = await provider.health();
    status.latencyMs = cmd.latencyMs;
    status.isHealthy = cmd.isHealthy;
    status.lastCheckedAt = new Date();

    if (this.healthRepo) {
      await this.healthRepo.saveHealth(status);
    }
    return true;
  }
}
