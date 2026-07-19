import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const recs = await ctx.searchRecommendations.execute({ studentId });
    return NextResponse.json(recs.map(r => ({
      id: r.id,
      studentId: r.studentId,
      rules: r.recommendationRules,
      source: r.recommendationSource,
      priority: r.priority.priority,
      priorityWeight: r.priority.weight,
      status: r.status,
      algorithmVersion: r.algorithmVersion,
      outputPayload: r.outputPayload,
    })));
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const body = await req.json();
    const recId = await ctx.generateRecommendations.execute({
      studentId,
      rules: body.rules || {},
      source: body.source || 'AI_GENERATED',
      priority: body.priority || 'MEDIUM',
      inputSnapshot: body.inputSnapshot || {},
      algorithmVersion: body.algorithmVersion || '1.0.0',
      decisionTrace: body.decisionTrace || {},
      outputPayload: body.outputPayload || {},
    });

    return NextResponse.json({ id: recId }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
