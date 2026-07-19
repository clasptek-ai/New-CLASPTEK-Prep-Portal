import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getStudentLearningContext();
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    if (action === 'withdraw') {
      await ctx.withdrawProgramme.execute({ enrollmentId: id, reason: reason ?? 'Withdrawn by student' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
