export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      mockId: body.mockId || 'mres-1',
      exam: body.exam || 'IELTS Academic',
      scoreResult: 'Band 7.0',
      targetScore: 'Band 7.5',
      updatedProjectedScore: 'Band 7.0',
      readinessImpact: '+3.2%',
      message: 'Mock examination performance analyzed and dynamic study plan updated.',
    },
    { status: 200 }
  );
}
