export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedBy = searchParams.get('requestedBy') || 'researcher-user';

    const ctx = await getLearningAnalyticsContext();
    const jobs = await ctx.researchExportPipeline.requestExport({
      requestedBy,
      datasetType: 'PROGRAMME_PERFORMANCE',
    });

    return NextResponse.json({
      success: true,
      data: [jobs],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
