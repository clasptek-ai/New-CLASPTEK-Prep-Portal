export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { DatabasePool } from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { PostgresPromptExperimentRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const tenantId = session.tenantId ?? '00000000-0000-0000-0000-000000000000';

    // We instantiate repository directly or retrieve via context
    const env = loadEnvironment();
    const logger = new ConsoleLogger('prompt-history');
    const dbPool = new DatabasePool(env, logger);
    const experimentRepo = new PostgresPromptExperimentRepository(dbPool);
    const experiments = await experimentRepo.findAll(tenantId);

    return NextResponse.json({
      success: true,
      experiments: experiments.map((e) => ({
        id: e.id,
        name: e.name,
        baselineVersionId: e.baselineVersionId,
        candidateVersionId: e.candidateVersionId,
        triggerReason: e.triggerReason,
        status: e.status,
        createdBy: e.createdBy,
        createdAt: e.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
