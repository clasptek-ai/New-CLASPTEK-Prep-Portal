export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || 'student-1';

    const ctx = await getLearningAnalyticsContext();
    const forecast = await ctx.getPredictiveForecasts.execute(studentId);

    return NextResponse.json({
      success: true,
      data: forecast,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
