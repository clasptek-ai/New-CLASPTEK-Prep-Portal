import type { AIProvider } from '../interfaces/AIProvider';

export class ProviderSelectionService {
  public selectBestProvider(
    providers: AIProvider[],
    preferredProviderCode?: string | undefined
  ): AIProvider {
    // If a preferred provider is active and available, use it.
    if (preferredProviderCode) {
      const match = providers.find(
        (p) => p.provider.toUpperCase() === preferredProviderCode.toUpperCase()
      );
      if (match) return match;
    }

    // Default to the first available healthy provider, prioritizing OpenAI -> Anthropic -> Gemini -> MOCK
    const order = ['OPENAI', 'ANTHROPIC', 'GEMINI', 'MOCK'];
    for (const code of order) {
      const match = providers.find((p) => p.provider.toUpperCase() === code);
      if (match) return match;
    }

    if (providers.length > 0) return providers[0];
    throw new Error('No AI Providers available in registry');
  }
}
