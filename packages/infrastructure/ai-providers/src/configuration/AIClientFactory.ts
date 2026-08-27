import { GeminiConfiguration } from './GeminiConfiguration';
import { GoogleGenAI as RealGoogleGenAI } from '@google/genai';

export type GoogleGenAI = any;

// Fallback Mock SDK class if real SDK is not available or for static testing
export class MockGoogleGenAI {
  public models = {
    generateContent: async (args: { model: string; contents: string }): Promise<any> => {
      if (!args.contents) throw new Error('Contents are required');
      const text = JSON.stringify({
        taskType: 'TASK_2',
        overallBand: 7.5,
        criteria: {
          taskAchievement: 7.5,
          coherenceCohesion: 7.5,
          lexicalResource: 7.5,
          grammaticalRangeAccuracy: 7.5,
        },
        feedback: 'Coherent essay with accurate sentence structures and well-developed arguments throughout.',
        strengths: ['Clear structure and progression', 'Good variety of vocabulary'],
        weaknesses: ['Minor lexical inaccuracies'],
        improvements: ['Practice expanding complex sentence forms.'],
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
}
