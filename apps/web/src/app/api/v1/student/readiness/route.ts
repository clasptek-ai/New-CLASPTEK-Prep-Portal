export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const progress = await ctx.getReadiness.execute({ studentId: session.userId });
    if (!progress) {
      return NextResponse.json({
        readinessScore: 0,
        readinessLevel: 'HIGH_RISK',
        lastReadinessUpdate: null,
      });
    }

    return NextResponse.json({
      readinessScore: progress.readinessScore.value,
      readinessLevel: progress.readinessLevel,
      lastReadinessUpdate: progress.lastReadinessUpdate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
