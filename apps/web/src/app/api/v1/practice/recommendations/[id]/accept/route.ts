import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAdaptivePracticeContext();
    const { id } = await params;
    const body = await req.json();
    const { planId } = body;
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    await ctx.acceptRecommendation.execute({ recommendationId: id, planId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
