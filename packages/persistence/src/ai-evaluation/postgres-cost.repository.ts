import { CostRepositoryContract } from '@clasptek/domain-ai-evaluation';

interface CostRecord {
  studentId: string;
  jobId: string;
  provider: string;
  modelCode: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  createdAt: Date;
}

export class PostgresCostRepository implements CostRepositoryContract {
  private costs: CostRecord[] = [];

  public async logCost(
    studentId: string,
    jobId: string,
    provider: string,
    modelCode: string,
    inputTokens: number,
    outputTokens: number,
    estimatedCostUsd: number
  ): Promise<void> {
    this.costs.push({
      studentId,
      jobId,
      provider,
      modelCode,
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      createdAt: new Date(),
    });
  }

  public async getAccumulatedSpend(studentId: string): Promise<number> {
    return this.costs
      .filter((c) => c.studentId === studentId)
      .reduce((sum, c) => sum + c.estimatedCostUsd, 0);
  }
}
