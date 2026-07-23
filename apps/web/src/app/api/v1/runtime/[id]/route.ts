export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const { id } = await params;
    const session = await ctx.getSession.execute({ sessionId: id });
    if (!session)
      return NextResponse.json({ error: 'Assessment session not found' }, { status: 404 });

    return NextResponse.json({
      id: session.id,
      studentId: session.studentId,
      instanceId: session.instanceId,
      status: session.status,
      resumeToken: session.resumeToken,
      lockVersion: session.lockVersion,
      checkpoint: session.checkpoint
        ? {
            checkpointVersion: session.checkpoint.checkpointVersion,
            activeQuestionId: session.checkpoint.activeQuestionId,
            elapsedTimeMs: session.checkpoint.elapsedTimeMs,
            answersSnapshot: session.checkpoint.answersSnapshot,
          }
        : undefined,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
