import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * GET /api/v1/readiness/velocity
 * Retrieve student learning velocity snapshots history.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const limitStr = searchParams.get('limit');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId query parameter is required' }, { status: 400 });
    }

    const limit = limitStr ? parseInt(limitStr) : undefined;
    const ctx = await getPredictionEngineContext();
    const history = await ctx.getLearningVelocityHistory.execute({
      studentId,
      limit
    });

    return NextResponse.json({ history });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
