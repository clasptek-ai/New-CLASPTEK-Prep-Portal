export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { calculatePlacementHandler } = await getDiagnosticContext();
    const body = await req.json();

    const formId = body.formId || 'd0000000-0000-0000-0000-000000000101';
    const placementId = await calculatePlacementHandler.execute({
      attemptId: id,
      formId,
    });

    return NextResponse.json({ success: true, placementId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
