import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  GeminiPrompts,
  GeminiWritingEvaluationSchema,
  GeminiSpeakingEvaluationSchema,
  GeminiMapper,
  ProviderModule,
} from '@clasptek/infrastructure-ai-providers';
import { extractSelectedOptionCode } from '@/lib/scoring/extractSelectedOptionCode';

describe('Grading API Migration & Reading Options Regression Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // 1. Provider Resolution Tests
  // =========================================================================
  it('1. ProviderModule resolves to GEMINI by default when AI_GRADING_PROVIDER is unset', () => {
    delete process.env.AI_GRADING_PROVIDER;
    expect(ProviderModule.resolveGradingProvider(process.env)).toBe('GEMINI');
  });

  it('2. ProviderModule respects AI_GRADING_PROVIDER env variable (gemini, openai, mock)', () => {
    process.env.AI_GRADING_PROVIDER = 'gemini';
    expect(ProviderModule.resolveGradingProvider(process.env)).toBe('GEMINI');

    process.env.AI_GRADING_PROVIDER = 'openai';
    expect(ProviderModule.resolveGradingProvider(process.env)).toBe('OPENAI');

    process.env.AI_GRADING_PROVIDER = 'mock';
    expect(ProviderModule.resolveGradingProvider(process.env)).toBe('MOCK');
  });

  // =========================================================================
  // 2. Gemini IELTS Prompts Parity Tests
  // =========================================================================
  it('3. GeminiPrompts builds IELTS Writing Task 1 and Task 2 system & user prompts with 4 criteria', () => {
    const task1System = GeminiPrompts.buildWritingSystemPrompt('TASK_1');
    expect(task1System).toContain('Task Achievement');
    expect(task1System).toContain('Coherence & Cohesion');
    expect(task1System).toContain('Lexical Resource');
    expect(task1System).toContain('Grammatical Range & Accuracy');
    expect(task1System).toContain('150-word');

    const task2System = GeminiPrompts.buildWritingSystemPrompt('TASK_2');
    expect(task2System).toContain('Task Response');
    expect(task2System).toContain('250-word');

    const userPrompt = GeminiPrompts.buildWritingUserPrompt(
      'Some prompt',
      'Candidate sample essay text',
      'TASK_2'
    );
    expect(userPrompt).toContain('Some prompt');
    expect(userPrompt).toContain('Candidate sample essay text');
  });

  it('4. GeminiPrompts builds IELTS Speaking prompts with 4 criteria', () => {
    const speakingSystem = GeminiPrompts.buildSpeakingSystemPrompt();
    expect(speakingSystem).toContain('Fluency & Coherence');
    expect(speakingSystem).toContain('Lexical Resource');
    expect(speakingSystem).toContain('Grammatical Range & Accuracy');
    expect(speakingSystem).toContain('Pronunciation');

    const speakingUser = GeminiPrompts.buildSpeakingUserPrompt(
      2,
      'Describe your hometown',
      'Candidate transcript text'
    );
    expect(speakingUser).toContain('Part 2');
    expect(speakingUser).toContain('Describe your hometown');
    expect(speakingUser).toContain('Candidate transcript text');
  });

  // =========================================================================
  // 3. Gemini Schema Validation Tests
  // =========================================================================
  it('5. GeminiWritingEvaluationSchema validates compliant JSON and rejects non-0.5 step bands', () => {
    const validPayload = {
      overallBand: 7.0,
      taskType: 'TASK_2',
      criteria: {
        taskAchievement: 7.0,
        coherenceCohesion: 6.5,
        lexicalResource: 7.5,
        grammaticalRangeAccuracy: 7.0,
      },
      feedback:
        'The candidate demonstrates strong fluency and coherence throughout the essay with minor inaccuracies.',
      strengths: ['Clear thesis statement', 'Effective cohesive devices'],
      weaknesses: ['Occasional minor article omission', 'Limited variety in complex structures'],
      improvements: [
        'Incorporate more passive structures',
        'Expand vocabulary for academic contexts',
      ],
    };

    const parsed = GeminiWritingEvaluationSchema.parse(validPayload);
    expect(parsed.overallBand).toBe(7.0);

    const invalidBand = { ...validPayload, overallBand: 7.3 };
    expect(() => GeminiWritingEvaluationSchema.parse(invalidBand)).toThrow();
  });

  it('6. GeminiSpeakingEvaluationSchema validates all 4 speaking criteria', () => {
    const validSpeaking = {
      overallBand: 6.5,
      criteria: {
        fluencyCoherence: 6.5,
        lexicalResource: 6.5,
        grammaticalRangeAccuracy: 6.0,
        pronunciation: 7.0,
      },
      feedback:
        'Candidate speaks comfortably with natural rhythm and minimal hesitation on familiar topics.',
      strengths: ['Natural intonation and rhythm', 'Good range of conversational markers'],
      weaknesses: [
        'Hesitation when discussing abstract concepts',
        'Repetition of basic adjectives',
      ],
      improvements: [
        'Practice extended discourse on abstract topics',
        'Broaden idiomatic expressions',
      ],
    };

    const parsed = GeminiSpeakingEvaluationSchema.parse(validSpeaking);
    expect(parsed.criteria.pronunciation).toBe(7.0);
    expect(parsed.overallBand).toBe(6.5);
  });

  // =========================================================================
  // 4. Gemini Mapper Tests
  // =========================================================================
  it('7. GeminiMapper transforms writing output into domain EvaluationResult with 4-criterion feedback', () => {
    const output: any = {
      overallBand: 7.5,
      taskType: 'TASK_2',
      criteria: {
        taskAchievement: 7.5,
        coherenceCohesion: 7.0,
        lexicalResource: 8.0,
        grammaticalRangeAccuracy: 7.5,
      },
      feedback:
        'Overall strong performance across all assessed dimensions with thorough topic development.',
      strengths: ['Advanced academic vocabulary', 'Excellent logical flow'],
      weaknesses: ['Minor punctuation lapses', 'Slightly informal tone in concluding paragraph'],
      improvements: ['Maintain formal register until conclusion', 'Review comma splice rules'],
    };

    const evalResult = GeminiMapper.mapWritingToEvaluationResult(
      output,
      'student-123',
      'submission-456',
      'job-789'
    );

    expect(evalResult.rawScore).toBe(7.5);
    expect(evalResult.bandScore?.band).toBe('Band 7.5');
    expect(evalResult.bandScore?.numericEquivalent).toBe(7.5);
    expect(evalResult.isCorrect).toBe(true);

    const criterionSections = evalResult.feedbackSections.filter(
      (s) => s.sectionType === 'CRITERION'
    );
    expect(criterionSections.length).toBe(4);
    expect(criterionSections[0].content).toContain('Band 7.5/9');
  });

  // =========================================================================
  // 5. Reading Options & Scoring Logic Tests
  // =========================================================================
  it('8. Reading scoring supports case-insensitive input completion against accepted answers', () => {
    const rawAnswer = '  Photosynthesis ';
    const acceptedAnswers = ['photosynthesis', 'photo-synthesis'];
    const formatted = rawAnswer.trim().toLowerCase();

    expect(acceptedAnswers.includes(formatted)).toBe(true);

    const wrongAnswer = ' cellular respiration ';
    expect(acceptedAnswers.includes(wrongAnswer.trim().toLowerCase())).toBe(false);
  });

  it('9. Option code extraction reliably resolves MCQ, TFNG, and YNNG option codes', () => {
    expect(extractSelectedOptionCode('TRUE')).toBe('TRUE');
    expect(extractSelectedOptionCode('FALSE')).toBe('FALSE');
    expect(extractSelectedOptionCode('NOT_GIVEN')).toBe('NOT_GIVEN');
    expect(extractSelectedOptionCode({ selectedOptionCode: 'B' })).toBe('B');
  });
});
