export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';
import type { MockResult } from '@clasptek/domain-mock-examination';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? 'demo-student';

    const ctx = getMockExaminationContext();
    const history = await ctx.getHistory.execute({ studentId });

    return NextResponse.json({
      success: true,
      history: history.map((r: MockResult) => ({
        id: r.id,
        sessionId: r.sessionId,
        overallRawScore: r.overallRawScore,
        officialScaledScore: r.officialScaledScore,
        officialScoreLabel: r.officialScoreLabel,
        percentile: r.percentile,
        status: r.status,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
