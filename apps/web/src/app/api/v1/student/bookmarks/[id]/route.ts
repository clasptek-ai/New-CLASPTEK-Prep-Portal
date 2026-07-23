export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getStudentLearningContext();
    const { id } = await params;
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    await ctx.removeBookmark.execute({ journeyId, bookmarkId: id });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}
