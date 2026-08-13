export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      sessionId: body.sessionId || 'session-1',
      analyzedQuestionsCount: Object.keys(body.answers || {}).length,
      updatedWeakSkill: 'Matching Headings',
      newAccuracy: 48,
      readinessImpact: '+1.5%',
      message: 'Practice session performance analyzed and intelligence profile updated.',
    },
    { status: 200 }
  );
}
