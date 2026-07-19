import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get('cohortId') || 'mock-cohort-id';

    return NextResponse.json({
      cohortId,
      totalPracticeSessions: 120,
      averageScore: 78.4,
      accuracyRate: 81.2,
      timeSpentSeconds: 432000
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
