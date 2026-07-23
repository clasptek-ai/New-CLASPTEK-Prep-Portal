export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GeminiConfigurationLoader, ProviderModule } from '@clasptek/infrastructure-ai-providers';
import { EvaluationQueue, EvaluationOrchestrator } from '@clasptek/domain-ai-evaluation';
import { EvaluationPipeline } from '@clasptek/application-ai-evaluation';

/**
 * POST /api/v1/internal/ai/health
 * Temporary development-only health & integration verification endpoint for Gemini Provider infrastructure.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint unavailable in production environment' },
      { status: 403 }
    );
  }

  try {
    // 1. Load and validate configuration
    const config = GeminiConfigurationLoader.fromEnv(process.env);

    // 2. Initialize provider manager via composition root
    const manager = ProviderModule.init(config);
    const providers = manager.getRegisteredProviders();

    // 3. Setup test job, queue, and orchestrator
    const queue = new EvaluationQueue('internal-health-queue', []);
    const item = queue.enqueue('job-health-verification', 'std-internal', 1, 'ASSESSMENT');
    const orchestrator = new EvaluationOrchestrator({ id: 'orch-health-verification' });

    // 4. Run pipeline
    const pipeline = new EvaluationPipeline();
    const { result, telemetry } = await pipeline.run(
      queue,
      item.id,
      orchestrator,
      providers,
      'GEMINI'
    );

    return NextResponse.json({
      status: 'success',
      provider: telemetry.provider,
      model: telemetry.model,
      latencyMs: telemetry.latencyMs,
      telemetry,
      evaluationResult: {
        rawScore: result.rawScore,
        feedbackSections: result.feedbackSections,
        recommendations: result.recommendations,
      },
    });
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const telemetry = err.telemetry || null;

    let statusCode = 500;
    if (errorMsg.includes('API_KEY') || errorMsg.includes('API key')) {
      statusCode = 401;
    } else if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
      statusCode = 429;
    } else if (errorMsg.includes('Timeout') || errorMsg.includes('timeout')) {
      statusCode = 504;
    } else if (errorMsg.includes('parsing') || errorMsg.includes('Schema')) {
      statusCode = 422;
    }

    return NextResponse.json(
      {
        status: 'error',
        error: errorMsg,
        telemetry,
      },
      { status: statusCode }
    );
  }
}
