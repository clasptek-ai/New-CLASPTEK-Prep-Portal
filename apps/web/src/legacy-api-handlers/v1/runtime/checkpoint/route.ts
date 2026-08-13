export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const body = await req.json();
    const {
      sessionId,
      checkpointVersion,
      activeQuestionId,
      elapsedTimeMs,
      answersSnapshot,
      deviceFingerprint,
      connectivitySnapshot,
      checksum,
      recordedAt,
    } = body;

    if (
      !sessionId ||
      checkpointVersion === undefined ||
      elapsedTimeMs === undefined ||
      !answersSnapshot ||
      !checksum
    ) {
      return NextResponse.json({ error: 'Missing required checkpoint fields' }, { status: 400 });
    }

    await ctx.createCheckpoint.execute({
      sessionId,
      checkpointVersion,
      activeQuestionId,
      elapsedTimeMs,
      answersSnapshot,
      deviceFingerprint,
      connectivitySnapshot,
      checksum,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const cp = await ctx.getCheckpoint.execute({ sessionId });
    if (!cp) return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });

    return NextResponse.json({
      id: cp.id,
      checkpointVersion: cp.checkpointVersion,
      activeQuestionId: cp.activeQuestionId,
      elapsedTimeMs: cp.elapsedTimeMs,
      answersSnapshot: cp.answersSnapshot,
      deviceFingerprint: cp.deviceFingerprint,
      connectivitySnapshot: cp.connectivitySnapshot,
      checksum: cp.checksum,
      recordedAt: cp.recordedAt,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
