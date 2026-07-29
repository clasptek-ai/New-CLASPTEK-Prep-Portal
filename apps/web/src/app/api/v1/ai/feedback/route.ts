export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      messageId: body.messageId || 'msg-1',
      rating: body.rating || 'HELPFUL',
      feedback: 'Thank you for your feedback. The AI Exam Coach will refine future recommendations.',
    },
    { status: 200 }
  );
}
