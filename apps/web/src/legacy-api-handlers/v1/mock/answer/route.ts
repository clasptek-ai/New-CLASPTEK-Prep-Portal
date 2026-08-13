export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, studentId, questionId, sectionId, answerPayload, timeSpentMs } = body;

    if (!sessionId || !questionId || !sectionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const ctx = getMockExaminationContext();
    await ctx.submitAnswer.execute({
      sessionId,
      studentId: studentId ?? 'anon-student',
      questionId,
      sectionId,
      answerPayload,
      timeSpentMs: timeSpentMs ?? 0,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
