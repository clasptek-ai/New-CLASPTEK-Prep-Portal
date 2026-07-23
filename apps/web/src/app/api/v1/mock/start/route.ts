export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, templateId } = body;

    if (!studentId || !templateId) {
      return NextResponse.json({ error: 'Missing studentId or templateId' }, { status: 400 });
    }

    const ctx = getMockExaminationContext();
    const sessionId = await ctx.startMock.execute({ studentId, templateId });

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
