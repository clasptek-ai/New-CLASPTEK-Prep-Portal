export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestedBy = 'researcher-user', datasetType = 'READINESS' } = body;

    const ctx = await getLearningAnalyticsContext();
    const job = await ctx.researchExportPipeline.requestExport({
      requestedBy,
      datasetType,
    });

    // Process export job asynchronously
    ctx.researchExportPipeline.processExportJob(job.id).catch((err) => {
      console.error(`Export job ${job.id} failed:`, err);
    });

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
