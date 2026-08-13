export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const ctx = await getLearningAnalyticsContext();
    const schedules = await ctx.searchReports.execute(search);

    return NextResponse.json(schedules);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ctx = await getLearningAnalyticsContext();

    if (body.recipientEmail && body.cronExpression) {
      const schedule = await ctx.scheduleReport.execute({
        reportDefinitionCode: body.reportDefinitionCode || 'WEEKLY_STUDENT_STATUS',
        recipientEmail: body.recipientEmail,
        cronExpression: body.cronExpression,
      });
      return NextResponse.json(schedule);
    } else {
      const report = await ctx.generateReport.execute({
        reportDefinitionCode: body.reportDefinitionCode || 'WEEKLY_STUDENT_STATUS',
      });
      return NextResponse.json(report);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
