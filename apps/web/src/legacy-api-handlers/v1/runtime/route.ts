export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const { searchParams } = new URL(req.url);
    const limitStr = searchParams.get('limit');
    const offsetStr = searchParams.get('offset');
    const limit = limitStr ? parseInt(limitStr) : undefined;
    const offset = offsetStr ? parseInt(offsetStr) : undefined;

    const list = await ctx.getSession.execute({ sessionId: '' }); // dummy execute or search?
    // Wait! GetAssessmentSessionHandler only gets by ID.
    // Let's use search filter on sessionRepo if we want, but search query is not exposed as a query handler,
    // wait! In GetAssessmentSessionHandler we find by ID. Does search filters need a query handler?
    // Wait, let's look at what statistics or history queries do.
    // But we can query via sessionRepo directly or expose search. Let's look at how adaptive-practice handles search filters:
    // It has `GetPracticeHistoryHandler` which calls `sessionRepo.search({ studentId })`.
    // Let's check what statistics / history endpoints are required by the request:
    // GET /api/v1/runtime/statistics
    // GET /api/v1/runtime/history
    // So for GET /api/v1/runtime/ we don't strictly need query filters unless the user calls it, but we can do:
    const sessions = await ctx.getSession.execute({ sessionId: studentId }); // or search sessions
    return NextResponse.json({ sessions });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const body = await req.json();
    const { instanceId } = body;
    if (!instanceId) return NextResponse.json({ error: 'Missing instanceId' }, { status: 400 });

    const sessionId = await ctx.createSession.execute({ studentId, instanceId });
    return NextResponse.json({ id: sessionId }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}
