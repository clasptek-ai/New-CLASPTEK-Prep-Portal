import type { AIProvider } from '../interfaces/AIProvider';

export class ProviderSelectionService {
  public selectBestProvider(
    providers: AIProvider[],
    preferredProviderCode?: string | undefined,
    allowEmergencyFallback?: boolean
  ): AIProvider {
    const isProduction = process.env.NODE_ENV === 'production';
    const emergencyFallbackEnabled =
      allowEmergencyFallback ?? process.env.ENABLE_EMERGENCY_AI_FALLBACK === 'true';

    // If a preferred provider is requested, strictly select it
    if (preferredProviderCode) {
      const match = providers.find(
        (p) => p.provider.toUpperCase() === preferredProviderCode.toUpperCase()
      );
      if (match) return match;

      // If preferred provider was explicitly specified but unavailable:
      if (!emergencyFallbackEnabled) {
        throw new Error(
          `AI Provider '${preferredProviderCode}' is unavailable. Automatic fallback is disabled.`
        );
      }
    }

    // Resolution order when preferred provider is not specified or emergency fallback is enabled:
    const order = ['GEMINI', 'OPENAI', 'ANTHROPIC'];
    if (!isProduction) {
      order.push('MOCK');
    }

    for (const code of order) {
      const match = providers.find((p) => p.provider.toUpperCase() === code);
      if (match) return match;
    }

    if (providers.length > 0 && !isProduction) return providers[0];
    throw new Error('No production-ready AI Providers available in registry');
  }
}
