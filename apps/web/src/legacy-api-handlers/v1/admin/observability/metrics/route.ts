export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getOrCreateRequestId } from '@/lib/correlation';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/admin/observability/metrics
 * Returns real-time production system health, DB stats, auth statistics,
 * assessment metrics, and recent error events for the Admin Operations Dashboard.
 */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req.headers);
  const startTime = Date.now();

  try {
    const session = await getAuthenticatedSession(req);
    const isAdmin =
      session?.roles?.some((r) =>
        ['ADMINISTRATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r.toUpperCase())
      ) || process.env.NODE_ENV === 'development';

    if (!isAdmin) {
      logger.warn('[OBSERVABILITY_API] Unauthorized access attempt', { requestId });
      return ApiResponse.unauthorized(requestId);
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // Parallel system health queries
    const [
      dbPingRes,
      attemptsSummaryRes,
      resultsSummaryRes,
      eventsSummaryRes,
      usersSummaryRes,
      questionsSummaryRes,
      recentErrorsRes,
    ] = await Promise.all([
      pool.query('SELECT NOW() as server_time, current_database() as db_name').catch(() => null),

      pool
        .query(
          `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h
        FROM public.assessment_attempts
      `
        )
        .catch(() => null),

      pool
        .query(
          `
        SELECT
          COUNT(*) as total,
          AVG(overall_score)::numeric(5,2) as avg_score,
          COUNT(*) FILTER (WHERE placement_level = 'ADVANCED') as advanced_cnt,
          COUNT(*) FILTER (WHERE placement_level = 'INTERMEDIATE') as intermediate_cnt,
          COUNT(*) FILTER (WHERE placement_level = 'FOUNDATION') as foundation_cnt
        FROM public.assessment_results
      `
        )
        .catch(() => null),

      pool
        .query(
          `
        SELECT COUNT(*) as total_events
        FROM public.assessment_attempt_events
      `
        )
        .catch(() => null),

      pool
        .query(
          `
        SELECT
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h
        FROM public.profiles
      `
        )
        .catch(() => null),

      pool
        .query(
          `
        SELECT
          COUNT(DISTINCT q.id) as total_questions,
          COUNT(*) FILTER (WHERE qv.proficiency_level = 'FOUNDATION') as foundation,
          COUNT(*) FILTER (WHERE qv.proficiency_level = 'INTERMEDIATE') as intermediate,
          COUNT(*) FILTER (WHERE qv.proficiency_level = 'ADVANCED') as advanced
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL
      `
        )
        .catch(() => null),

      pool
        .query(
          `
        SELECT attempt_id, event_type, event_payload, created_at
        FROM public.assessment_attempt_events
        WHERE event_type ILIKE '%ERROR%' OR event_type ILIKE '%FAIL%'
        ORDER BY created_at DESC LIMIT 10
      `
        )
        .catch(() => null),
    ]);

    const dbLatencyMs = Date.now() - startTime;

    const data = {
      system: {
        status: dbPingRes ? 'OPERATIONAL' : 'DEGRADED',
        dbConnected: Boolean(dbPingRes),
        dbLatencyMs,
        serverTime: dbPingRes?.rows[0]?.server_time || new Date().toISOString(),
        databaseName: dbPingRes?.rows[0]?.db_name || 'postgres',
        environment: process.env.NODE_ENV || 'production',
      },
      users: {
        total: parseInt(usersSummaryRes?.rows[0]?.total_users || '0', 10),
        newLast24h: parseInt(usersSummaryRes?.rows[0]?.new_users_24h || '0', 10),
      },
      assessments: {
        totalAttempts: parseInt(attemptsSummaryRes?.rows[0]?.total || '0', 10),
        inProgress: parseInt(attemptsSummaryRes?.rows[0]?.in_progress || '0', 10),
        submitted: parseInt(attemptsSummaryRes?.rows[0]?.submitted || '0', 10),
        last24h: parseInt(attemptsSummaryRes?.rows[0]?.last_24h || '0', 10),
        completedResults: parseInt(resultsSummaryRes?.rows[0]?.total || '0', 10),
        averageScore: parseFloat(resultsSummaryRes?.rows[0]?.avg_score || '0'),
        levelBreakdown: {
          advanced: parseInt(resultsSummaryRes?.rows[0]?.advanced_cnt || '0', 10),
          intermediate: parseInt(resultsSummaryRes?.rows[0]?.intermediate_cnt || '0', 10),
          foundation: parseInt(resultsSummaryRes?.rows[0]?.foundation_cnt || '0', 10),
        },
      },
      content: {
        totalQuestions: parseInt(questionsSummaryRes?.rows[0]?.total_questions || '0', 10),
        stratification: {
          foundation: parseInt(questionsSummaryRes?.rows[0]?.foundation || '0', 10),
          intermediate: parseInt(questionsSummaryRes?.rows[0]?.intermediate || '0', 10),
          advanced: parseInt(questionsSummaryRes?.rows[0]?.advanced || '0', 10),
        },
      },
      telemetry: {
        totalEventsLogged: parseInt(eventsSummaryRes?.rows[0]?.total_events || '0', 10),
        recentErrors: recentErrorsRes?.rows || [],
      },
    };

    logger.api({
      requestId,
      method: 'GET',
      endpoint: '/api/v1/admin/observability/metrics',
      status: 200,
      duration: Date.now() - startTime,
      userId: session?.userId,
    });

    return ApiResponse.success(data, { requestId });
  } catch (err: unknown) {
    logger.error('[OBSERVABILITY_API_ERROR]', err, { requestId });
    return ApiResponse.internalError(requestId, err instanceof Error ? err.message : String(err));
  }
}
