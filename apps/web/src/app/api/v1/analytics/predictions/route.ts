import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelVersion = searchParams.get('modelVersion') || 'v1.0';

    const ctx = await getLearningAnalyticsContext();
    const stats = await ctx.getPredictionAnalytics.execute(modelVersion);

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
