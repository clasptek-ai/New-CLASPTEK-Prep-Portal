export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      sessionId: body.sessionId || 'msession-1',
      savedAnswersCount: Object.keys(body.answers || {}).length,
      savedAt: new Date().toISOString(),
      message: 'Mock examination state saved successfully.',
    },
    { status: 200 }
  );
}
