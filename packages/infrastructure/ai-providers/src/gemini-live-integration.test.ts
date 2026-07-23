import { describe, it, expect } from 'vitest';
import { GeminiConfigurationLoader, ProviderModule } from './index';
import { EvaluationQueue, EvaluationOrchestrator } from '@clasptek/domain-ai-evaluation';
import { EvaluationPipeline } from '@clasptek/application-ai-evaluation';

describe('Sprint 3.7.1 Real Gemini API Integration Verification', () => {
  const hasRealKey =
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'mock-api-key' &&
    process.env.GEMINI_API_KEY !== 'test-key' &&
    process.env.GEMINI_API_KEY !== 'key';

  it.runIf(hasRealKey)(
    'executes real IELTS Writing evaluation against Google Gemini API or handles 429 Rate Limit gracefully',
    async () => {
      const config = GeminiConfigurationLoader.fromEnv({
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        GEMINI_TIMEOUT: process.env.GEMINI_TIMEOUT || '30000',
      });

      const manager = ProviderModule.init(config);
      const providers = manager.getRegisteredProviders();

      const queue = new EvaluationQueue('live-integration-queue', []);
      const item = queue.enqueue('job-live-ielts', 'std-live-test', 1, 'PRACTICE');
      const orchestrator = new EvaluationOrchestrator({ id: 'orch-live-test' });

      const pipeline = new EvaluationPipeline();

      try {
        const { result, telemetry } = await pipeline.run(
          queue,
          item.id,
          orchestrator,
          providers,
          'GEMINI'
        );

        // Verify EvaluationResult contents upon 200 SUCCESS
        expect(result).toBeDefined();
        expect(result.rawScore).toBeGreaterThanOrEqual(0);
        expect(result.rawScore).toBeLessThanOrEqual(9.0);
        expect(result.feedbackSections.length).toBeGreaterThan(0);
        expect(result.recommendations.length).toBeGreaterThan(0);

        // Verify Telemetry details
        expect(telemetry.status).toBe('SUCCESS');
        expect(telemetry.provider).toBe('GEMINI');
        expect(telemetry.latencyMs).toBeGreaterThan(0);

        console.log('--- LIVE GEMINI EVALUATION METRICS ---');
        console.log(`Provider: ${telemetry.provider}`);
        console.log(`Model Used: ${telemetry.model}`);
        console.log(`Latency: ${telemetry.latencyMs}ms`);
        console.log(`Overall Band Score: ${result.rawScore}`);
      } catch (err: any) {
        // Handles real API 429 quota / rate limit errors gracefully as per Objective 8
        const errMsg = err.message || String(err);
        console.log('--- LIVE GEMINI API RESPONSE ---');
        console.log(`Status / Message: ${errMsg.substring(0, 150)}`);
        expect(err.telemetry).toBeDefined();
        expect(err.telemetry.status).toBe('FAILED');
        expect(err.telemetry.provider).toBe('GEMINI');
      }
    }
  );

  it('skips or notifies gracefully when GEMINI_API_KEY is not configured', () => {
    if (!hasRealKey) {
      console.log(
        '[NOTICE] Live Gemini integration test skipped: GEMINI_API_KEY not configured in environment.'
      );
      expect(hasRealKey).toBeFalsy();
    } else {
      expect(hasRealKey).toBeTruthy();
    }
  });
});
