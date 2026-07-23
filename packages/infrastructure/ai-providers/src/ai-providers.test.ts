import { describe, it, expect } from 'vitest';
import {
  GeminiProvider,
  ProviderModule,
  AIResponseParser,
  EvaluationSchema,
  GeminiMapper,
  GeminiConfigurationLoader,
  GeminiGateway,
  GeminiClient,
} from './index';
import { EvaluationExecutionContext } from '@clasptek/domain-ai-evaluation';

describe('Sprint 3.7.1 AI Infrastructure — Provider Selection & Manager', () => {
  it('loads, registers, and disables providers dynamically', () => {
    const config = { apiKey: 'test-key', model: 'gemini-1.5-pro', timeoutMs: 30000 };
    const manager = ProviderModule.init(config);

    const active = manager.getRegisteredProviders();
    expect(active.length).toBe(2);
    expect(active.map((p) => p.provider)).toContain('GEMINI');

    // Disable provider
    manager.setEnabled('GEMINI', false);
    expect(manager.getRegisteredProviders().length).toBe(1);
    expect(manager.getProvider('GEMINI')).toBeNull();

    // Re-enable provider
    manager.setEnabled('GEMINI', true);
    expect(manager.getProvider('GEMINI')).toBeDefined();
  });
});

describe('Sprint 3.7.1 AI Infrastructure — Response Parsing & Validation Pipeline', () => {
  it('extracts raw JSON block and parses it successfully', () => {
    const rawLLMOutput =
      'Some pre-text greeting. ```json\n{\n  "overallBand": 7.5,\n  "criteria": {\n    "taskAchievement": 7,\n    "coherence": 8,\n    "lexicalResource": 8,\n    "grammar": 7\n  },\n  "feedback": "Coherent essay text.",\n  "improvements": ["Expand vocabulary range."]\n}\n``` post-text footer.';

    const rawObj = AIResponseParser.parseJsonBlock(rawLLMOutput);
    expect(rawObj.overallBand).toBe(7.5);

    const validated = EvaluationSchema.validateGemini(rawObj);
    expect(validated.criteria.coherence).toBe(8);

    const result = GeminiMapper.mapToEvaluationResult(validated, 'std-1', 'sub-1', 'job-1');
    expect(result.rawScore).toBe(7.5);
    expect(result.feedbackSections.length).toBe(1);
    expect(result.recommendations.length).toBe(1);
  });

  it('fails validation when JSON is malformed or missing fields', () => {
    const invalidObj = {
      overallBand: 12.0, // out of bounds (0-9)
      criteria: {},
    };
    expect(() => EvaluationSchema.validateGemini(invalidObj)).toThrow();
  });
});

describe('Sprint 3.7.1 AI Infrastructure — Gateway & Provider End-to-End Mocked flow', () => {
  it('executes end-to-end evaluateWriting flow', async () => {
    const client = new GeminiClient({ apiKey: 'key', model: 'gemini-1.5-pro', timeoutMs: 10000 });
    const gateway = new GeminiGateway(client);
    const provider = new GeminiProvider(gateway);

    const context: EvaluationExecutionContext = {
      provider: 'GEMINI',
      model: 'gemini-1.5-pro',
      prompt: 'Write about tourism.',
      timeout: 10000,
      temperature: 0.2,
      maxTokens: 1000,
      rubric: {},
      studentId: 'std-101',
      submissionId: 'sub-101',
      jobId: 'job-101',
      retryAttempt: 1,
      evaluationType: 'WRITING',
    };

    const result = await provider.evaluateWriting(context);
    expect(result.rawScore).toBe(7.5);
    expect(result.feedbackSections[0].content).toContain('Coherent essay');
  });

  it('executes integration evaluateWriting flow with a mocked GeminiGateway', async () => {
    const mockGateway = {
      generate: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    overallBand: 8.0,
                    criteria: {
                      taskAchievement: 8,
                      coherence: 8,
                      lexicalResource: 8,
                      grammar: 8,
                    },
                    feedback: 'Exceptional work.',
                    improvements: ['None'],
                  }),
                },
              ],
            },
          },
        ],
      }),
      getModelCode: () => 'mock-gemini-model',
    };

    const provider = new GeminiProvider(mockGateway as any);
    const context: EvaluationExecutionContext = {
      provider: 'GEMINI',
      model: 'gemini-1.5-pro',
      prompt: 'Prompt content',
      timeout: 10000,
      temperature: 0.2,
      maxTokens: 1000,
      rubric: {},
      studentId: 'std-102',
      submissionId: 'sub-102',
      jobId: 'job-102',
      retryAttempt: 1,
      evaluationType: 'WRITING',
    };

    const result = await provider.evaluateWriting(context);
    expect(result.rawScore).toBe(8.0);
    expect(result.feedbackSections[0].content).toBe('Exceptional work.');
  });
});

describe('Sprint 3.7.1 AI Infrastructure — Gemini Configuration Loader', () => {
  it('loads valid configuration from environment values', () => {
    const mockEnv = {
      GEMINI_API_KEY: 'mock-api-key',
      GEMINI_MODEL: 'gemini-1.5-pro',
      GEMINI_TIMEOUT: '30000',
    };

    const config = GeminiConfigurationLoader.fromEnv(mockEnv);
    expect(config.apiKey).toBe('mock-api-key');
    expect(config.model).toBe('gemini-1.5-pro');
    expect(config.timeoutMs).toBe(30000);
  });

  it('throws descriptive validation errors on missing environment values', () => {
    const invalidEnv = {
      GEMINI_API_KEY: '',
      GEMINI_MODEL: 'gemini-1.5-pro',
      // GEMINI_TIMEOUT is missing
    };

    expect(() => GeminiConfigurationLoader.fromEnv(invalidEnv)).toThrow(
      'Gemini configuration initialization failed'
    );
  });
});

describe('Sprint 3.7.1 AI Infrastructure — Gemini Gateway', () => {
  it('calls the client models generateContent method and returns raw response', async () => {
    const client = new GeminiClient({ apiKey: 'key', model: 'gemini-1.5-pro', timeoutMs: 10000 });
    const gateway = new GeminiGateway(client);

    const rawResponse = await gateway.generate('Write an essay on global warming');
    expect(rawResponse.candidates).toBeDefined();
    expect(rawResponse.candidates?.[0]?.content?.parts?.[0]?.text).toContain('overallBand');
  });

  it('throws error when prompt is empty', async () => {
    const client = new GeminiClient({ apiKey: 'key', model: 'gemini-1.5-pro', timeoutMs: 10000 });
    const gateway = new GeminiGateway(client);

    await expect(gateway.generate('')).rejects.toThrow('Prompt template is empty or undefined');
  });
});

describe('Sprint 3.7.1 AI Infrastructure — AIResponseParser Unit Tests', () => {
  it('parses raw text with markdown code blocks', () => {
    const raw = 'Here is the result:\n```json\n{\n  "score": 7\n}\n```\nHope it helps!';
    const result = AIResponseParser.parseJsonBlock(raw);
    expect(result.score).toBe(7);
  });

  it('parses plain JSON with leading/trailing spaces', () => {
    const raw = '   {\n  "score": 8\n}   ';
    const result = AIResponseParser.parseJsonBlock(raw);
    expect(result.score).toBe(8);
  });

  it('parses JSON with extra explanations before and after', () => {
    const raw = 'The analysis yielded: {"score": 9} which is excellent.';
    const result = AIResponseParser.parseJsonBlock(raw);
    expect(result.score).toBe(9);
  });

  it('throws descriptive parsing exception on malformed JSON', () => {
    const raw = '{"score": 9, missingQuote }';
    expect(() => AIResponseParser.parseJsonBlock(raw)).toThrow('AI response JSON parsing failed');
  });

  it('throws descriptive parsing exception on empty input', () => {
    expect(() => AIResponseParser.parseJsonBlock('')).toThrow('AI response is empty or undefined');
  });
});

describe('Sprint 3.7.1 AI Infrastructure — EvaluationSchema Unit Tests', () => {
  it('validates a correct evaluation response object successfully', () => {
    const valid = {
      overallBand: 7.5,
      criteria: {
        taskAchievement: 7.5,
        coherence: 7.0,
        lexicalResource: 8.0,
        grammar: 7.5,
      },
      feedback: 'Very good structure.',
      improvements: ['Improve vocabulary depth.'],
    };

    const validated = EvaluationSchema.validate(valid);
    expect(validated.overallBand).toBe(7.5);
    expect(validated.feedback).toBe('Very good structure.');
  });

  it('rejects a response missing the overallBand property', () => {
    const invalid = {
      criteria: {
        taskAchievement: 7.5,
        coherence: 7.0,
        lexicalResource: 8.0,
        grammar: 7.5,
      },
      feedback: 'Very good structure.',
      improvements: [],
    };

    expect(() => EvaluationSchema.validate(invalid)).toThrow('overallBand is required');
  });

  it('rejects a response with out-of-range overallBand score', () => {
    const invalid = {
      overallBand: 11.0, // out of range
      criteria: {
        taskAchievement: 7.5,
        coherence: 7.0,
        lexicalResource: 8.0,
        grammar: 7.5,
      },
      feedback: 'Very good structure.',
      improvements: [],
    };

    expect(() => EvaluationSchema.validate(invalid)).toThrow('overallBand cannot exceed 9');
  });
});

describe('Sprint 3.7.1 AI Infrastructure — ProviderModule Startup', () => {
  it('instantiates and registers multiple providers from environment details', () => {
    const mockEnv = {
      GEMINI_API_KEY: 'env-api-key',
      GEMINI_MODEL: 'gemini-1.5-pro',
      GEMINI_TIMEOUT: '20000',
    };

    const manager = ProviderModule.initFromEnv(mockEnv);
    const registered = manager.getRegisteredProviders();

    // Registers mock + gemini
    expect(registered.length).toBe(2);
    expect(registered.map((r) => r.provider)).toContain('GEMINI');
    expect(registered.map((r) => r.provider)).toContain('MOCK');
  });
});
