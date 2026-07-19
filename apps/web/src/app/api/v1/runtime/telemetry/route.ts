import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const body = await req.json();
    const { type, sessionId } = body;
    if (!type || !sessionId) return NextResponse.json({ error: 'Missing type or sessionId' }, { status: 400 });

    const session = await ctx.getSession.execute({ sessionId });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (type === 'heartbeat') {
      const { elapsedTimeMs, activeQuestionId, browserVisibility, networkStatus } = body;
      if (elapsedTimeMs === undefined || !browserVisibility || !networkStatus) {
        return NextResponse.json({ error: 'Missing heartbeat parameters' }, { status: 400 });
      }
      session.recordHeartbeat({
        elapsedTimeMs,
        activeQuestionId,
        browserVisibility,
        networkStatus,
        recordedAt: new Date(),
      });
      // Save updated telemetry log
      const env = require('@clasptek/configuration').loadEnvironment();
      const logger = new (require('@clasptek/observability').ConsoleLogger)('telemetry-persistence');
      const dbPool = new (require('@clasptek/persistence').DatabasePool)(env, logger);
      const sessionRepo = new (require('@clasptek/persistence').PostgresAssessmentSessionRepository)(dbPool);
      await sessionRepo.save(session);
      return NextResponse.json({ success: true });
    }

    if (type === 'incident') {
      const { incidentType, payload } = body;
      if (!incidentType || !payload) {
        return NextResponse.json({ error: 'Missing incident parameters' }, { status: 400 });
      }
      session.recordSecurityIncident({
        incidentType,
        payload,
        recordedAt: new Date(),
      });
      const env = require('@clasptek/configuration').loadEnvironment();
      const logger = new (require('@clasptek/observability').ConsoleLogger)('telemetry-persistence');
      const dbPool = new (require('@clasptek/persistence').DatabasePool)(env, logger);
      const sessionRepo = new (require('@clasptek/persistence').PostgresAssessmentSessionRepository)(dbPool);
      await sessionRepo.save(session);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported telemetry type' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const history = await ctx.getNavigationHistory.execute({ sessionId });
    return NextResponse.json({ history });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
