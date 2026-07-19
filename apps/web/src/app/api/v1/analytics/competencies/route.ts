import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';
import { CompetencyAnalytics } from '@clasptek/domain-learning-analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competencyCode = searchParams.get('competencyCode');

    if (!competencyCode) {
      return NextResponse.json({ error: 'Missing competencyCode parameter' }, { status: 400 });
    }

    const ctx = await getLearningAnalyticsContext();
    let analytics = await ctx.getCompetencyAnalytics.execute(competencyCode);

    if (!analytics) {
      // Create stub competency analytics representation
      analytics = CompetencyAnalytics.create(competencyCode, 'Mock Competency', 76.5);
    }

    return NextResponse.json(analytics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
