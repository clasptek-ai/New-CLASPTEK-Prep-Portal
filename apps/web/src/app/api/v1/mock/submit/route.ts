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
    const result = await ctx.submitMock.execute({ sessionId });

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        sessionId: result.sessionId,
        overallRawScore: result.overallRawScore,
        officialScaledScore: result.officialScaledScore,
        officialScoreLabel: result.officialScoreLabel,
        percentile: result.percentile,
        status: result.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
