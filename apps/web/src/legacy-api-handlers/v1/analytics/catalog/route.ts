export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET() {
  try {
    const ctx = await getLearningAnalyticsContext();
    const metrics = await ctx.getMetricCatalog.execute();
    return NextResponse.json({
      success: true,
      data: {
        catalogName: 'Enterprise Institutional Metrics Catalog',
        version: 'v2.1.1',
        metrics,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
