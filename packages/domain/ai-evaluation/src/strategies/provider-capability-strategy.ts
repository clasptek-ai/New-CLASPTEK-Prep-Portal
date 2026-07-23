export interface ProviderCapabilities {
  supportedModels: string[];
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  tokenLimit: number;
}

export interface ProviderCapabilityStrategy {
  readonly provider: 'OPENAI' | 'AZURE' | 'ANTHROPIC' | 'GEMINI' | 'MOCK';
  getCapabilities(): ProviderCapabilities;
}

export class OpenAIStrategy implements ProviderCapabilityStrategy {
  public readonly provider = 'OPENAI';
  public getCapabilities(): ProviderCapabilities {
    return {
      supportedModels: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      supportsVision: true,
      supportsAudio: false,
      supportsJsonMode: true,
      supportsStreaming: true,
      tokenLimit: 128000,
    };
  }
}

export class AzureOpenAIStrategy implements ProviderCapabilityStrategy {
  public readonly provider = 'AZURE';
  public getCapabilities(): ProviderCapabilities {
    return {
      supportedModels: ['gpt-4o-azure', 'gpt-4-azure'],
      supportsVision: true,
      supportsAudio: false,
      supportsJsonMode: true,
      supportsStreaming: true,
      tokenLimit: 128000,
    };
  }
}

export class AnthropicStrategy implements ProviderCapabilityStrategy {
  public readonly provider = 'ANTHROPIC';
  public getCapabilities(): ProviderCapabilities {
    return {
      supportedModels: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
      supportsVision: true,
      supportsAudio: false,
      supportsJsonMode: false,
      supportsStreaming: true,
      tokenLimit: 200000,
    };
  }
}

export class GeminiStrategy implements ProviderCapabilityStrategy {
  public readonly provider = 'GEMINI';
  public getCapabilities(): ProviderCapabilities {
    return {
      supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
      supportsVision: true,
      supportsAudio: true,
      supportsJsonMode: true,
      supportsStreaming: true,
      tokenLimit: 1000000,
    };
  }
}

export class MockStrategy implements ProviderCapabilityStrategy {
  public readonly provider = 'MOCK';
  public getCapabilities(): ProviderCapabilities {
    return {
      supportedModels: ['mock-v1'],
      supportsVision: false,
      supportsAudio: false,
      supportsJsonMode: true,
      supportsStreaming: false,
      tokenLimit: 8192,
    };
  }
}

export class ProviderCapabilityStrategyFactory {
  public static getStrategy(providerCode: string): ProviderCapabilityStrategy {
    switch (providerCode.toUpperCase()) {
      case 'OPENAI':
        return new OpenAIStrategy();
      case 'AZURE':
      case 'AZURE_OPENAI':
        return new AzureOpenAIStrategy();
      case 'ANTHROPIC':
        return new AnthropicStrategy();
      case 'GEMINI':
        return new GeminiStrategy();
      case 'MOCK':
      default:
        return new MockStrategy();
    }
  }
}
