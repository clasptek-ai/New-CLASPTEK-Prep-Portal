import type { EvaluationResult } from '../index';

export interface ProviderTelemetry {
  latencyMs: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  attempts: number;
  status: string;
}

export interface EvaluationExecutionContext {
  provider: string;
  model: string;
  prompt: string;
  timeout: number;
  temperature: number;
  maxTokens: number;
  rubric: Record<string, any>;
  studentId: string;
  submissionId: string;
  jobId: string;
  retryAttempt: number;
  evaluationType: 'WRITING' | 'SPEAKING';
}

export interface EvaluationHealth {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  consecutiveFailures: number;
  lastCheckedAt: Date;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  currency: string;
}

export interface WritingEvaluator {
  evaluateWriting(context: EvaluationExecutionContext): Promise<EvaluationResult>;
}

export interface SpeakingEvaluator {
  evaluateSpeaking(context: EvaluationExecutionContext): Promise<EvaluationResult>;
}

export interface AIProvider extends WritingEvaluator, SpeakingEvaluator {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  health(): Promise<EvaluationHealth>;
  estimateCost(inputTokens: number, outputTokens: number): CostEstimate;

  // Backward compatibility signatures
  evaluate?(prompt: any): Promise<any>;
  isAvailable?(): Promise<boolean>;
  estimateTokens?(text: string): number;
  supportsStreaming?(): boolean;
  supportsVision?(): boolean;
  supportsAudio?(): boolean;
}
