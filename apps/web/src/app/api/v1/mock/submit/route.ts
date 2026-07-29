export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const resultId = `mres-${Date.now()}`;

  return NextResponse.json(
    {
      success: true,
      resultId,
      sessionId: body.sessionId || 'msession-1',
      exam: body.exam || 'IELTS Academic',
      score: '32 / 40',
      bandResult: 'Band 7.5 Good User',
      completedAt: new Date().toISOString(),
      message: 'Mock examination successfully evaluated and scored.',
    },
    { status: 200 }
  );
}
