export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const profileId = searchParams.get('profileId');

    if (!studentId || !profileId) {
      return NextResponse.json(
        { error: 'Missing studentId or profileId parameter' },
        { status: 400 }
      );
    }

    const ctx = await getLearningAnalyticsContext();
    let dashboard = await ctx.getStudentDashboard.execute(studentId, profileId);

    if (!dashboard) {
      // Auto-generate if missing
      dashboard = await ctx.generateStudentDashboard.execute({ studentId, profileId });
    }

    return NextResponse.json(dashboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
