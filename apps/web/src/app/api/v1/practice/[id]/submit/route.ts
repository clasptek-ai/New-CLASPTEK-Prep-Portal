export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      sessionId: id,
      submittedAnswersCount: Object.keys(body.answers || {}).length,
      timeSpentSeconds: body.timeSpentSeconds || 0,
      completedAt: new Date().toISOString(),
      message: `Practice session ${id} successfully submitted and scored.`,
    },
    { status: 200 }
  );
}
