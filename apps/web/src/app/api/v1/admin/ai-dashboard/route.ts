export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER'];

/**
 * GET /api/v1/admin/ai-dashboard
 *
 * Returns AI evaluation system KPI metrics for the admin AI dashboard.
 * Requires ADMIN, SUPER_ADMIN, ADMINISTRATOR, or EXAMINER role.
 *
 * Response:
 * {
 *   queue: { queued, running, completed, approved, failed },
 *   accuracy: { agreementRate, calibrationAccuracy, overrideRate },
 *   cost: { totalUsdThisMonth, avgCostPerEvaluation },
 *   latency: { avgMs, p95Ms },
 *   recentRuns: BenchmarkRun[]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: requires ADMIN, SUPER_ADMIN, or EXAMINER role' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') ?? 'default';

    const ctx = getAiEvaluationContext();

    // Pull benchmark runs and regressions for quality metrics
    const [runs, regressions] = await Promise.all([
      ctx.getBenchmarkRuns.execute(tenantId),
      ctx.getRegressionHistory.execute(tenantId),
    ]);

    // Derive queue-status metrics from benchmark run history
    const completedRuns = runs.filter((r: any) => r.status === 'COMPLETED' || r.completedAt);
    const latestRun = completedRuns.at(-1) as any;

    const metrics = {
      queue: {
        queued: runs.filter((r: any) => r.status === 'PENDING').length,
        running: runs.filter((r: any) => r.status === 'RUNNING').length,
        completed: completedRuns.length,
        failed: runs.filter((r: any) => r.status === 'FAILED').length,
        total: runs.length,
      },
      accuracy: {
        agreementRate: latestRun?.agreementRate?.rate ?? null,
        calibrationAccuracy: latestRun?.calibrationAccuracy?.value ?? null,
        overrideRate: latestRun?.overrideRate ?? null,
      },
      cost: {
        totalUsdAllTime: runs.reduce(
          (sum: number, r: any) => sum + (r.evaluationCost?.totalUsd ?? 0),
          0
        ),
        avgCostPerEvaluation: latestRun?.evaluationCost?.avgPerEvaluation ?? null,
        currency: 'USD',
      },
      latency: {
        avgMs: latestRun?.averageLatency?.avgMs ?? null,
        p95Ms: latestRun?.averageLatency?.p95Ms ?? null,
        p99Ms: latestRun?.averageLatency?.p99Ms ?? null,
      },
      regressions: {
        total: regressions.length,
        critical: regressions.filter((r: any) => r.severity === 'CRITICAL').length,
        warning: regressions.filter((r: any) => r.severity === 'WARNING').length,
      },
      recentRuns: runs.slice(-5).reverse(),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
