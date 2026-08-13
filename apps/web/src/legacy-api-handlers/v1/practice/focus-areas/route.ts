export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const grammarAccuracy = parseFloat(req.nextUrl.searchParams.get('grammar') || '70');
    const readingSpeedWpm = parseInt(req.nextUrl.searchParams.get('speed') || '180');
    const vocabularyScore = parseFloat(req.nextUrl.searchParams.get('vocab') || '75');

    const recommendedCategory = await ctx.getFocusAreas.execute({
      grammarAccuracy,
      readingSpeedWpm,
      vocabularyScore,
    });

    return NextResponse.json({ recommendedCategory });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
