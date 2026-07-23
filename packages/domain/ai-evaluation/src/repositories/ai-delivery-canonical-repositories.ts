import type { ProviderHealthStatus } from '../index';
import { EvaluationBudget } from '../aggregates/evaluation-budget.aggregate';
import { EvaluationQueue } from '../aggregates/evaluation-queue.aggregate';

export interface AIProviderHealthRepositoryContract {
  saveHealth(health: ProviderHealthStatus): Promise<void>;
  findHealthByProvider(provider: string): Promise<ProviderHealthStatus | null>;
  findAllHealth(): Promise<ProviderHealthStatus[]>;
}

export interface AIProviderRegistryRepositoryContract {
  saveProviderConfig(provider: string, config: Record<string, any>): Promise<void>;
  getProviderConfig(provider: string): Promise<Record<string, any> | null>;
}

export interface CostRepositoryContract {
  logCost(
    studentId: string,
    jobId: string,
    provider: string,
    modelCode: string,
    inputTokens: number,
    outputTokens: number,
    estimatedCostUsd: number
  ): Promise<void>;
  getAccumulatedSpend(studentId: string): Promise<number>;
}

export interface BudgetRepositoryContract {
  saveBudget(budget: EvaluationBudget): Promise<void>;
  findBudget(): Promise<EvaluationBudget | null>;
}

export interface SlaMetricsRepositoryContract {
  logSlaMetric(
    jobId: string,
    type: string,
    latencySeconds: number,
    targetSeconds: number,
    isBreached: boolean,
    severity: string
  ): Promise<void>;
  getBreachCount(): Promise<number>;
}

export interface EvaluationQueueRepositoryContract {
  saveQueue(queue: EvaluationQueue): Promise<void>;
  findQueue(): Promise<EvaluationQueue | null>;
}
