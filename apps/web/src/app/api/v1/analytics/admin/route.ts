import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId parameter' }, { status: 400 });
    }

    const ctx = await getLearningAnalyticsContext();
    let dashboard = await ctx.getAdminDashboard.execute(orgId);

    if (!dashboard) {
      dashboard = await ctx.generateAdminDashboard.execute({ orgId });
    }

    return NextResponse.json(dashboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
