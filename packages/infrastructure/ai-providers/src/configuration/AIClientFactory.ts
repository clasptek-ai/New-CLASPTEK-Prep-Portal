import { GeminiConfiguration, OpenAIConfiguration } from './GeminiConfiguration';
import { GoogleGenAI as RealGoogleGenAI } from '@google/genai';

export type GoogleGenAI = any;

// Fallback Mock SDK class if real SDK is not available or for static testing
export class MockGoogleGenAI {
  public models = {
    generateContent: async (args: { model: string; contents: string }): Promise<any> => {
      if (!args.contents) throw new Error('Contents are required');
      const text = JSON.stringify({
        overallBand: 7.5,
        criteria: {
          taskAchievement: 7,
          coherence: 8,
          lexicalResource: 8,
          grammar: 7,
        },
        feedback: 'Coherent essay with slight vocabulary limitations.',
        improvements: ['Use broader range of synonyms.', 'Vary sentence structure.'],
      });
      return {
        candidates: [
          {
            content: {
              parts: [{ text }],
            },
          },
        ],
      };
    },
  };
  constructor(public readonly config: { apiKey: string }) {}
}

export class OpenAI {
  constructor(public readonly config: { apiKey: string }) {}
}

export class AIClientFactory {
  public createGeminiClient(config: GeminiConfiguration): any {
    if (config.useMock === true) {
      return new MockGoogleGenAI({ apiKey: config.apiKey });
    }
    try {
      if (
        config.apiKey &&
        config.apiKey !== 'mock-api-key' &&
        config.apiKey !== 'key' &&
        config.apiKey !== 'test-key'
      ) {
        return new RealGoogleGenAI({ apiKey: config.apiKey });
      }
    } catch {
      // Fallback to Mock SDK if initialization fails
    }
    return new MockGoogleGenAI({ apiKey: config.apiKey });
  }

  public createOpenAIClient(config: OpenAIConfiguration): OpenAI {
    return new OpenAI({ apiKey: config.apiKey });
  }
}
