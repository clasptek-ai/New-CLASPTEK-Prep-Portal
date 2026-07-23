export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const initiatedBy = body.initiatedBy || 'admin';
    const isProduction = body.isProduction ?? false;

    const ctx = await getLearningAnalyticsContext();
    const job = await ctx.refreshAnalytics.execute({
      initiatedBy,
      isProduction,
    });

    return NextResponse.json(job);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
