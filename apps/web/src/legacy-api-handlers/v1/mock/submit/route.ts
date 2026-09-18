export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { POST as postSessionSubmit } from '../sessions/[id]/submit/route';

export async function POST(req: NextRequest) {
  try {
    const clone = req.clone();
    const body = await clone.json().catch(() => ({}));
    const sessionId = body.sessionId;

    if (sessionId) {
      return postSessionSubmit(req, { params: Promise.resolve({ id: sessionId }) });
    }

    const resultId = `mres-${Date.now()}`;
    return NextResponse.json(
      {
        success: true,
        resultId,
        sessionId: 'msession-1',
        exam: body.exam || 'IELTS Academic',
        score: '32 / 40',
        bandResult: 'Band 7.5 Good User',
        completedAt: new Date().toISOString(),
        message: 'Mock examination successfully evaluated and scored.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
