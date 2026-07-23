import {
  ProviderHealthStatus,
  AIProviderHealthRepositoryContract,
} from '@clasptek/domain-ai-evaluation';

export class PostgresProviderHealthRepository implements AIProviderHealthRepositoryContract {
  private healthStore = new Map<string, ProviderHealthStatus>();

  public async saveHealth(health: ProviderHealthStatus): Promise<void> {
    this.healthStore.set(health.provider, health);
  }

  public async findHealthByProvider(provider: string): Promise<ProviderHealthStatus | null> {
    return this.healthStore.get(provider) || null;
  }

  public async findAllHealth(): Promise<ProviderHealthStatus[]> {
    return Array.from(this.healthStore.values());
  }
}
