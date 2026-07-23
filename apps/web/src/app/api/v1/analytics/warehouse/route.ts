export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getLearningAnalyticsContext();
    const snapshot = await ctx.warehouseService.getLatestSnapshot();
    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        status: 'ONLINE',
        lastMaterializedAt: snapshot?.generatedAt || new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const ctx = await getLearningAnalyticsContext();
    const snapshot = await ctx.warehouseService.buildWarehouseSnapshot();
    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
