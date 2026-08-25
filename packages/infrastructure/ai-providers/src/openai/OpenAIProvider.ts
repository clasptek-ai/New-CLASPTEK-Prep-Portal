import {
  AIProvider,
  EvaluationExecutionContext,
  EvaluationHealth,
  CostEstimate,
  EvaluationResult,
} from '@clasptek/domain-ai-evaluation';
import { OpenAIGateway } from './OpenAIGateway';
import { AIResponseParser } from '../parsing/AIResponseParser';
import { IELTSWritingEvaluationSchema, IELTSSpeakingEvaluationSchema } from './OpenAISchema';
import { OpenAIMapper } from './OpenAIMapper';
import { OpenAIPrompts } from './OpenAIPrompts';

/**
 * OpenAI IELTS Provider — implements the AIProvider interface for real
 * IELTS Writing and Speaking evaluation via the OpenAI API.
 *
 * NO FALLBACK: If OpenAI is unavailable, this provider throws.
 * The caller must set status = FAILED, never fabricate scores.
 */
export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai-provider-v1';
  public readonly name = 'OpenAI IELTS Provider';
  public readonly provider = 'OPENAI';

  constructor(private readonly gateway: OpenAIGateway) {}

  /**
   * Evaluate IELTS Writing using OpenAI chat completions.
   *
   * The context.prompt is expected to contain the candidate's essay text.
   * The context.rubric may contain: { taskType, taskPrompt }
   */
  public async evaluateWriting(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    const taskType: 'TASK_1' | 'TASK_2' = context.rubric?.taskType || 'TASK_2';
    const taskPrompt: string = context.rubric?.taskPrompt || '';
    const candidateResponse: string = context.prompt;

    if (!candidateResponse || candidateResponse.trim().length === 0) {
      throw new Error('Cannot evaluate empty writing response');
    }

    const systemPrompt = OpenAIPrompts.buildWritingSystemPrompt(taskType);
    const stimulusContext =
      context.rubric?.stimulusContext || context.rubric?.stimulusDescription || '';
    const userPrompt = OpenAIPrompts.buildWritingUserPrompt(
      taskPrompt,
      candidateResponse,
      taskType,
      stimulusContext
    );

    const response = await this.gateway.generateChatCompletion(systemPrompt, userPrompt, {
      temperature: context.temperature,
      maxTokens: context.maxTokens,
    });

    const rawObj = AIResponseParser.parseJsonBlock(response.content);
    const validated = IELTSWritingEvaluationSchema.parse(rawObj);

    return OpenAIMapper.mapWritingToEvaluationResult(
      validated,
      context.studentId,
      context.submissionId,
      context.jobId
    );
  }

  /**
   * Evaluate IELTS Speaking using OpenAI chat completions.
   *
   * If context.rubric.audioUrl is provided and no transcript exists,
   * the gateway will first transcribe the audio using Whisper.
   *
   * The context.prompt is expected to contain the transcript (or will be populated after transcription).
   * The context.rubric may contain: { partNumber, questionPrompt, audioUrl, audioBuffer }
   */
  public async evaluateSpeaking(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    let transcript = context.prompt;
    const partNumber: number = context.rubric?.partNumber || 1;
    const questionPrompt: string = context.rubric?.questionPrompt || '';

    // If we have audio but no transcript, transcribe first
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

    const systemPrompt = OpenAIPrompts.buildSpeakingSystemPrompt();
    const userPrompt = OpenAIPrompts.buildSpeakingUserPrompt(
      partNumber,
      questionPrompt,
      transcript
    );

    const response = await this.gateway.generateChatCompletion(systemPrompt, userPrompt, {
      temperature: context.temperature,
      maxTokens: context.maxTokens,
    });

    const rawObj = AIResponseParser.parseJsonBlock(response.content);
    const validated = IELTSSpeakingEvaluationSchema.parse(rawObj);

    return OpenAIMapper.mapSpeakingToEvaluationResult(
      validated,
      context.studentId,
      context.submissionId,
      context.jobId
    );
  }

  public async health(): Promise<EvaluationHealth> {
    try {
      // Lightweight health check — verify the client can reach OpenAI
      const response = await this.gateway.generateChatCompletion(
        'You are a health check assistant. Respond with valid JSON.',
        'Return: {"status": "ok"}',
        { temperature: 0, maxTokens: 20 }
      );
      const isHealthy = response.content.includes('ok');

      return {
        provider: 'OPENAI',
        isHealthy,
        latencyMs: 0,
        circuitState: isHealthy ? 'CLOSED' : 'OPEN',
        consecutiveFailures: isHealthy ? 0 : 1,
        lastCheckedAt: new Date(),
      };
    } catch {
      return {
        provider: 'OPENAI',
        isHealthy: false,
        latencyMs: 0,
        circuitState: 'OPEN',
        consecutiveFailures: 1,
        lastCheckedAt: new Date(),
      };
    }
  }

  public estimateCost(inputTokens: number, outputTokens: number): CostEstimate {
    // GPT-4o pricing: $2.50/1M input, $10.00/1M output
    const costUsd = (inputTokens / 1_000_000) * 2.5 + (outputTokens / 1_000_000) * 10.0;
    return new CostEstimate(inputTokens, outputTokens, parseFloat(costUsd.toFixed(6)));
  }
}
