import { AIProviderManager } from './AIProviderManager';
import { GeminiClient } from '../gemini/GeminiClient';
import { GeminiGateway } from '../gemini/GeminiGateway';
import { GeminiProvider } from '../gemini/GeminiProvider';
import { GeminiConfiguration, GeminiConfigurationLoader } from './GeminiConfiguration';
import { MockAIProvider } from '@clasptek/domain-ai-evaluation';

export class ProviderModule {
  public static init(geminiConfig: GeminiConfiguration): AIProviderManager {
    const manager = new AIProviderManager();

    // 1. Construct and Register Google Gemini Provider
    const client = new GeminiClient(geminiConfig);
    const gateway = new GeminiGateway(client);
    const gemini = new GeminiProvider(gateway);
    manager.register(gemini);

    // 2. Construct and Register Mock AI Provider
    const mock = new MockAIProvider();
    manager.register(mock);

    // 3. Stubs for future OpenAI Provider registration
    // const openaiClient = new OpenAIClient(openaiConfig);
    // const openaiProvider = new OpenAIProvider(openaiClient);
    // manager.register(openaiProvider);

    // 4. Stubs for future Anthropic Provider registration
    // const anthropicProvider = new AnthropicProvider(anthropicClient);
    // manager.register(anthropicProvider);

    // 5. Stubs for future Azure OpenAI Provider registration
    // const azureProvider = new AzureOpenAIProvider(azureClient);
    // manager.register(azureProvider);

    return manager;
  }

  public static initFromEnv(
    env: Record<string, string | undefined> = process.env
  ): AIProviderManager {
    const geminiConfig = GeminiConfigurationLoader.fromEnv(env);
    return this.init(geminiConfig);
  }
}
