export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json().catch(() => ({}));

    // Derive student identity from auth session or header in dev
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized: Student authentication required' }, { status: 401 });
    }

    const { startAttemptHandler } = await getDiagnosticContext();
    const id = randomUUID();
    const catalogId = body.catalogId || 'd0000000-0000-0000-0000-000000000001';
    const tenantId = session?.tenantId || body.tenantId || '00000000-0000-0000-0000-000000000000';

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
