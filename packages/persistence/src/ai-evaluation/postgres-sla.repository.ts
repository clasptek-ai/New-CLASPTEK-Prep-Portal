import { SlaMetricsRepositoryContract } from '@clasptek/domain-ai-evaluation';

interface SlaRecord {
  jobId: string;
  type: string;
  latencySeconds: number;
  targetSeconds: number;
  isBreached: boolean;
  severity: string;
  recordedAt: Date;
}

export class PostgresSlaRepository implements SlaMetricsRepositoryContract {
  private records: SlaRecord[] = [];

  public async logSlaMetric(
    jobId: string,
    type: string,
    latencySeconds: number,
    targetSeconds: number,
    isBreached: boolean,
    severity: string
  ): Promise<void> {
    this.records.push({
      jobId,
      type,
      latencySeconds,
      targetSeconds,
      isBreached,
      severity,
      recordedAt: new Date(),
    });
  }

  public async getBreachCount(): Promise<number> {
    return this.records.filter((r) => r.isBreached).length;
  }
}
