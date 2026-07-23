export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    const ctx = await getLearningAnalyticsContext();
    const handler = ctx.getMetricCatalog;

    if (code) {
      const metric = await handler.executeByCode(code);
      if (!metric) {
        return NextResponse.json(
          { success: false, error: `Metric ${code} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: metric });
    }

    const metrics = await handler.execute();
    return NextResponse.json({ success: true, data: metrics });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
