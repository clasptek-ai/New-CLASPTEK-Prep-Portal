import { AIProviderManager } from './AIProviderManager';
import { GeminiClient } from '../gemini/GeminiClient';
import { GeminiGateway } from '../gemini/GeminiGateway';
import { GeminiProvider } from '../gemini/GeminiProvider';
import { GeminiConfiguration, GeminiConfigurationLoader } from './GeminiConfiguration';
import { OpenAIConfigurationLoader, OpenAIConfiguration } from './OpenAIConfiguration';
import { OpenAIClient } from '../openai/OpenAIClient';
import { OpenAIGateway } from '../openai/OpenAIGateway';
import { OpenAIProvider } from '../openai/OpenAIProvider';
import { MockAIProvider } from '@clasptek/domain-ai-evaluation';

export class ProviderModule {
  public static init(
    geminiConfig: GeminiConfiguration,
    openaiConfig?: OpenAIConfiguration | null
  ): AIProviderManager {
    const manager = new AIProviderManager();

    // 1. Construct and Register Google Gemini Provider
    const client = new GeminiClient(geminiConfig);
    const gateway = new GeminiGateway(client);
    const gemini = new GeminiProvider(gateway);
    manager.register(gemini);

    // 2. Construct and Register Mock AI Provider
    const mock = new MockAIProvider();
    manager.register(mock);

    // 3. Construct and Register OpenAI Provider (if configured — retained as rollback option)
    if (openaiConfig) {
      try {
        const openaiClient = new OpenAIClient(openaiConfig);
        const openaiGateway = new OpenAIGateway(openaiClient);
        const openaiProvider = new OpenAIProvider(openaiGateway);
        manager.register(openaiProvider);
        console.info(
          `[PROVIDER_MODULE] OpenAI provider registered (rollback). Model: ${openaiConfig.model}, Whisper: ${openaiConfig.whisperModel}`
        );
      } catch (err: any) {
        console.warn(
          `[PROVIDER_MODULE] OpenAI provider registration failed (rollback unavailable): ${err.message}`
        );
      }
    }

    return manager;
  }

  public static initFromEnv(
    env: Record<string, string | undefined> = process.env
  ): AIProviderManager {
    const geminiConfig = GeminiConfigurationLoader.fromEnv(env);
    const openaiConfig = OpenAIConfigurationLoader.fromEnv(env);
    return this.init(geminiConfig, openaiConfig);
  }

  /**
   * Resolve the active grading provider code from environment configuration.
   *
   * Priority:
   *   1. AI_GRADING_PROVIDER env var (e.g. 'gemini' or 'openai')
   *   2. Default: 'GEMINI' (production default)
   *
   * This determines which registered provider handles IELTS subjective grading.
   * OpenAI is retained only as a controlled rollback option.
   */
  public static resolveGradingProvider(
    env: Record<string, string | undefined> = process.env
  ): string {
    const configured = env.AI_GRADING_PROVIDER?.trim()?.toUpperCase();
    if (configured === 'OPENAI' || configured === 'GEMINI' || configured === 'MOCK') {
      return configured;
    }
    // Default to GEMINI for production
    return 'GEMINI';
  }
}
