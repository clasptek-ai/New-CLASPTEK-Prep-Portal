import {
  AIProvider,
  EvaluationExecutionContext,
  EvaluationHealth,
  CostEstimate,
  EvaluationResult,
} from '@clasptek/domain-ai-evaluation';
import { GeminiGateway } from './GeminiGateway';
import { AIResponseParser } from '../parsing/AIResponseParser';
import { GeminiMapper } from './GeminiMapper';
import { GeminiPrompts } from './GeminiPrompts';
import {
  GeminiWritingEvaluationSchema,
  GeminiSpeakingEvaluationSchema,
  roundToHalfBand,
} from './GeminiSchema';

/**
 * Google Gemini IELTS Provider — implements the AIProvider interface for real
 * IELTS Writing and Speaking evaluation via the Google Gemini API.
 *
 * NO FALLBACK: If Gemini is unavailable, this provider throws.
 * The caller must set status = FAILED, never fabricate scores.
 */
export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini-provider-v1';
  public readonly name = 'Google Gemini IELTS Provider';
  public readonly provider = 'GEMINI';

  constructor(private readonly gateway: GeminiGateway) {}

  /**
   * Evaluate IELTS Writing using Gemini chat completions.
   *
   * The context.prompt is expected to contain the candidate's essay text.
   * The context.rubric may contain: { taskType, taskPrompt, stimulusContext }
   */
  public async evaluateWriting(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    const taskType: 'TASK_1' | 'TASK_2' = context.rubric?.taskType || 'TASK_2';
    const taskPrompt: string = context.rubric?.taskPrompt || '';
    const candidateResponse: string = context.prompt;

    if (!candidateResponse || candidateResponse.trim().length === 0) {
      throw new Error('Cannot evaluate empty writing response');
    }

    const stimulusContext =
      context.rubric?.stimulusContext || context.rubric?.stimulusDescription || '';
    const promptInput = GeminiPrompts.writing({
      taskType,
      taskPrompt,
      response: candidateResponse,
      stimulusContext,
    });

    const response = await this.gateway.generateChatCompletion(promptInput, {
      temperature: context.temperature,
      maxTokens: context.maxTokens,
      timeout: context.timeout,
    });

    const rawObj = AIResponseParser.parseJsonBlock(response.content);
    const validated = GeminiWritingEvaluationSchema.parse(rawObj);

    // CRITICAL: Deterministic server-side overallBand calculation (do not trust Gemini's overallBand)
    const serverCalculatedBand = roundToHalfBand(
      (validated.criteria.taskAchievement +
        validated.criteria.coherenceCohesion +
        validated.criteria.lexicalResource +
        validated.criteria.grammaticalRangeAccuracy) /
        4
    );

    const evaluatedPayload = {
      ...validated,
      overallBand: serverCalculatedBand,
    };

    return GeminiMapper.mapWritingToEvaluationResult(
      evaluatedPayload,
      context.studentId,
      context.submissionId,
      context.jobId
    );
  }

  /**
   * Evaluate IELTS Speaking using Gemini chat completions.
   *
   * If context.rubric.audioBuffer is provided and no transcript exists,
   * the gateway will first transcribe the audio using Gemini's native audio understanding.
   *
   * The context.prompt is expected to contain the transcript (or will be populated after transcription).
   * The context.rubric may contain: { partNumber, questionPrompt, audioBuffer, audioFilename }
   */
  public async evaluateSpeaking(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    let transcript = context.prompt;
    const partNumber: number = context.rubric?.partNumber || 1;
    const questionPrompt: string = context.rubric?.questionPrompt || '';

    // If we have audio but no transcript, transcribe first using Gemini's native audio
    if ((!transcript || transcript.trim().length === 0) && context.rubric?.audioBuffer) {
      const audioBuffer = Buffer.isBuffer(context.rubric.audioBuffer)
        ? context.rubric.audioBuffer
        : Buffer.from(context.rubric.audioBuffer);
      const filename = context.rubric?.audioFilename || 'speaking.webm';

      const transcription = await this.gateway.transcribeAudio(audioBuffer, filename);
      transcript = transcription.text;
    }

    if (!transcript || transcript.trim().length === 0) {
      throw new Error(
        'Cannot evaluate speaking: no transcript provided and no audio available for transcription'
      );
    }

    const promptInput = GeminiPrompts.speaking({
      part: partNumber,
      prompt: questionPrompt,
      transcript,
    });

    const response = await this.gateway.generateChatCompletion(promptInput, {
      temperature: context.temperature,
      maxTokens: context.maxTokens,
      timeout: context.timeout,
    });

    const rawObj = AIResponseParser.parseJsonBlock(response.content);
    const validated = GeminiSpeakingEvaluationSchema.parse(rawObj);

    // CRITICAL: Deterministic server-side overallBand calculation (do not trust Gemini's overallBand)
    const serverCalculatedBand = roundToHalfBand(
      (validated.criteria.fluencyCoherence +
        validated.criteria.lexicalResource +
        validated.criteria.grammaticalRangeAccuracy +
        validated.criteria.pronunciation) /
        4
    );

    const evaluatedPayload = {
      ...validated,
      overallBand: serverCalculatedBand,
    };

    return GeminiMapper.mapSpeakingToEvaluationResult(
      evaluatedPayload,
      context.studentId,
      context.submissionId,
      context.jobId
    );
  }

  public async health(): Promise<EvaluationHealth> {
    try {
      const response = await this.gateway.generateChatCompletion(
        'You are a health check assistant. Respond with valid JSON.',
        'Return: {"status": "ok"}',
        { temperature: 0, maxTokens: 20 }
      );
      const isHealthy = response.content.includes('ok');

      return {
        provider: 'GEMINI',
        isHealthy,
        latencyMs: 0,
        circuitState: isHealthy ? 'CLOSED' : 'OPEN',
        consecutiveFailures: isHealthy ? 0 : 1,
        lastCheckedAt: new Date(),
      };
    } catch {
      return {
        provider: 'GEMINI',
        isHealthy: false,
        latencyMs: 0,
        circuitState: 'OPEN',
        consecutiveFailures: 1,
        lastCheckedAt: new Date(),
      };
    }
  }

  public estimateCost(inputTokens: number, outputTokens: number): CostEstimate {
    const costUsd = (inputTokens / 1_000_000) * 3.5 + (outputTokens / 1_000_000) * 10.5;
    return new CostEstimate(inputTokens, outputTokens, parseFloat(costUsd.toFixed(6)));
  }
}
