export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const profileCode = searchParams.get('profileCode') ?? 'IELTS_ACADEMIC';

    const benchmark = await ctx.getBenchmark.execute(profileCode);
    if (!benchmark) return NextResponse.json({ instructors: [] });

    return NextResponse.json({ instructors: benchmark.instructors });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
