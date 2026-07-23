import {
  AIProvider,
  EvaluationExecutionContext,
  EvaluationHealth,
  CostEstimate,
  EvaluationResult,
} from '@clasptek/domain-ai-evaluation';
import { GeminiGateway } from './GeminiGateway';
import { AIResponseParser } from '../parsing/AIResponseParser';
import { EvaluationSchema } from '../validation/EvaluationSchema';
import { GeminiMapper } from './GeminiMapper';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini-provider-v1';
  public readonly name = 'Google Gemini Provider';
  public readonly provider = 'GEMINI';

  constructor(private readonly gateway: GeminiGateway) {}

  public async evaluateWriting(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    const rawRes = await this.gateway.generate(context.prompt);
    const textContent = rawRes.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('No candidate content parts found in Gemini response');
    }

    const rawObj = AIResponseParser.parseJsonBlock(textContent);
    const verifiedOutput = EvaluationSchema.validateGemini(rawObj);

    return GeminiMapper.mapToEvaluationResult(
      verifiedOutput,
      context.studentId,
      context.submissionId,
      context.jobId
    );
  }

  public async evaluateSpeaking(context: EvaluationExecutionContext): Promise<EvaluationResult> {
    return this.evaluateWriting(context);
  }

  public async health(): Promise<EvaluationHealth> {
    return {
      provider: 'GEMINI',
      isHealthy: true,
      latencyMs: 120,
      circuitState: 'CLOSED',
      consecutiveFailures: 0,
      lastCheckedAt: new Date(),
    };
  }

  public estimateCost(inputTokens: number, outputTokens: number): CostEstimate {
    const costUsd = (inputTokens / 1_000_000) * 3.5 + (outputTokens / 1_000_000) * 10.5;
    return new CostEstimate(inputTokens, outputTokens, parseFloat(costUsd.toFixed(6)));
  }
}
