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

    const body = await req.json();
    const payload = body.payload || body;

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    const result = await importerRepo.importJsonBatch(payload, session?.userId || 'admin-user');

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      batchCode: result.batchCode,
      importedCount: result.importedCount,
    });
  } catch (err: any) {
    console.error('[IMPORT COMMIT FAILED]:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'The Question Bank could not complete this import. No questions were committed.',
        referenceCode: 'IMPORT_COMMIT_FAILED',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
