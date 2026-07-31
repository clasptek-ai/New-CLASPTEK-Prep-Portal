export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { CanonicalJsonImporterRepository } from '@clasptek/persistence';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { batchId } = await req.json();
    if (!batchId) {
      return NextResponse.json({ error: 'Missing batchId' }, { status: 400 });
    }

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    await importerRepo.rollbackBatch(batchId);

    return NextResponse.json({
      success: true,
      message: `Batch ${batchId} rolled back successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
