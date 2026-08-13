export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getResultsContext } from '@/lib/results-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const ctx = getResultsContext();
    const body = await req.json();
    const { reportType, title, format } = body;

    if (!reportType) {
      return NextResponse.json({ error: 'reportType is required' }, { status: 400 });
    }

    const report = await ctx.generateReport.execute({
      studentId: session.userId,
      reportType,
      title,
      format,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
