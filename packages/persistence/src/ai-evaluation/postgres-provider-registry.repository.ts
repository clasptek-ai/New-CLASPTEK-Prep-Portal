import { AIProviderRegistryRepositoryContract } from '@clasptek/domain-ai-evaluation';

export class PostgresProviderRegistryRepository implements AIProviderRegistryRepositoryContract {
  private configStore = new Map<string, Record<string, any>>();

  public async saveProviderConfig(provider: string, config: Record<string, any>): Promise<void> {
    this.configStore.set(provider, config);
  }

  public async getProviderConfig(provider: string): Promise<Record<string, any> | null> {
    return this.configStore.get(provider) || null;
  }
}
