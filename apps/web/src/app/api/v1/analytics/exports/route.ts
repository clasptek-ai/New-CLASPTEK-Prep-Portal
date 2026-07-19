import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format = body.format || 'CSV';

    const ctx = await getLearningAnalyticsContext();
    const job = await ctx.exportAnalytics.execute({
      format,
      generatedBy: 'admin'
    });

    return NextResponse.json(job);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing export job id parameter' }, { status: 400 });
    }

    // Mock query database directly or via stub repository
    return NextResponse.json({
      id,
      format: 'CSV',
      status: 'COMPLETED',
      downloadExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'admin',
      downloadUrl: 'https://downloads.clasptek.com/exports/export.csv'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
