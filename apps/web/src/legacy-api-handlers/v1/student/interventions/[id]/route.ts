export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { id } = await params;
    await ctx.acknowledgeIntervention.execute({ interventionId: id });

    return NextResponse.json({ success: true, interventionId: id, status: 'ACKNOWLEDGED' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
