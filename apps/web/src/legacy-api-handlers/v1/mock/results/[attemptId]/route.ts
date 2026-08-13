export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { attemptId } = await params;

    return NextResponse.json({
      attemptId,
      studentId: session.userId,
      overallRawScore: 82.5,
      officialScaledScore: 7.5,
      officialScoreLabel: 'IELTS Band 7.5',
      percentile: 91,
      status: 'SCORED',
      hasPendingSubjectiveEvaluations: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
