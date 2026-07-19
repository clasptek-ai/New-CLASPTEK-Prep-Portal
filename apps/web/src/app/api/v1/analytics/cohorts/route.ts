import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get('cohortId');

    if (!cohortId) {
      return NextResponse.json({ error: 'Missing cohortId parameter' }, { status: 400 });
    }

    const ctx = await getLearningAnalyticsContext();
    const metrics = await ctx.getAssessmentAnalytics.execute(cohortId);
    return NextResponse.json({ cohortId, metrics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
