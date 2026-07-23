export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { startAttemptHandler } = await getDiagnosticContext();
    const body = await req.json();

    const id = randomUUID();
    const studentId = body.studentId || randomUUID();
    const catalogId = body.catalogId || 'd0000000-0000-0000-0000-000000000001';
    const tenantId = body.tenantId || '00000000-0000-0000-0000-000000000000';

    await startAttemptHandler.execute({
      id,
      studentId,
      catalogId,
      tenantId,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
