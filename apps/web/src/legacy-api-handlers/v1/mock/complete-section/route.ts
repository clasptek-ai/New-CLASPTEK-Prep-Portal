export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const ctx = getMockExaminationContext();
    await ctx.completeSection.execute({ sessionId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
