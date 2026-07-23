export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET() {
  try {
    const ctx = await getLearningAnalyticsContext();
    const alerts = await ctx.qualityMonitorEngine.runQualityScan();
    return NextResponse.json({
      success: true,
      data: {
        overallStatus: alerts.length === 0 ? 'VALID' : 'DEGRADED',
        activeAlerts: alerts,
        scannedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
