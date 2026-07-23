export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? 'demo-student';

    const ctx = getMockExaminationContext();
    const history = await ctx.getHistory.execute({ studentId });
    const targetResult = history[0];

    if (!targetResult) {
      return NextResponse.json({
        success: true,
        readiness: {
          overallReadinessPct: 75,
          passProbabilityPct: 70,
          recommendedStudyHours: 12,
        },
      });
    }

    const readiness = await ctx.calculateReadiness.execute({
      studentId,
      resultId: targetResult.id,
    });

    return NextResponse.json({
      success: true,
      readiness: {
        id: readiness.id,
        studentId: readiness.studentId,
        overallReadinessPct: readiness.overallReadinessPct,
        passProbabilityPct: readiness.passProbabilityPct,
        recommendedStudyHours: readiness.recommendedStudyHours,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
