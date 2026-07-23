import { AIProvider } from '@clasptek/domain-ai-evaluation';

export class AIProviderManager {
  private providers = new Map<string, AIProvider>();
  private activeStates = new Map<string, boolean>();

  public register(provider: AIProvider): void {
    this.providers.set(provider.provider.toUpperCase(), provider);
    this.activeStates.set(provider.provider.toUpperCase(), true);
  }

  public unregister(providerCode: string): void {
    const key = providerCode.toUpperCase();
    this.providers.delete(key);
    this.activeStates.delete(key);
  }

  public getProvider(providerCode: string): AIProvider | null {
    const key = providerCode.toUpperCase();
    if (!this.activeStates.get(key)) return null; // disabled
    return this.providers.get(key) || null;
  }

  public setEnabled(providerCode: string, enabled: boolean): void {
    this.activeStates.set(providerCode.toUpperCase(), enabled);
  }

  public getRegisteredProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) =>
      this.activeStates.get(p.provider.toUpperCase())
    );
  }
}
