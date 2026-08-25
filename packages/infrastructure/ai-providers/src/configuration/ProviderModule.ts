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

    // 3. Construct and Register OpenAI Provider (if configured)
    if (openaiConfig) {
      try {
        const openaiClient = new OpenAIClient(openaiConfig);
        const openaiGateway = new OpenAIGateway(openaiClient);
        const openaiProvider = new OpenAIProvider(openaiGateway);
        manager.register(openaiProvider);
        console.info(
          `[PROVIDER_MODULE] OpenAI provider registered successfully. Model: ${openaiConfig.model}, Whisper: ${openaiConfig.whisperModel}`
        );
      } catch (err: any) {
        console.error(
          `[PROVIDER_MODULE] Failed to register OpenAI provider: ${err.message}. IELTS subjective grading will NOT be available.`
        );
        // Do NOT fall back to Gemini for IELTS subjective grading.
        // The evaluateSubjectiveJob caller must handle the missing OPENAI provider.
      }
    } else {
      console.warn(
        '[PROVIDER_MODULE] OPENAI_API_KEY not configured. OpenAI provider NOT registered. IELTS subjective grading will NOT be available.'
      );
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
}
