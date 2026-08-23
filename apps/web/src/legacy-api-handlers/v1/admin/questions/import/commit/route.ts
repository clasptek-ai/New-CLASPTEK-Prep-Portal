export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession, isValidTenantUuid } from '@/lib/auth-util';
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

    const tenantId = session?.tenantId;
    if (!tenantId || !isValidTenantUuid(tenantId)) {
      return NextResponse.json(
        {
          error: 'INVALID_TENANT_CONTEXT',
          message: 'A valid authorized tenant context is required for Question Bank import.',
          referenceCode: 'INVALID_TENANT_CONTEXT',
          failingOperation: 'RESOLVE_TENANT_CONTEXT',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const payload = body.payload || body;

    const questionCount = Array.isArray(payload?.questions) ? payload.questions.length : 0;
    const passageCount = Array.isArray(payload?.passages)
      ? payload.passages.length
      : Array.isArray(payload?.readingPassages)
        ? payload.readingPassages.length
        : Array.isArray(payload?.reading_passages)
          ? payload.reading_passages.length
          : 0;

    console.log('[IMPORT_COMMIT_ROUTE_DIAGNOSTIC]', {
      authenticatedUserId: session?.userId,
      resolvedTenantId: tenantId,
      tenantResolutionSource: session?.tenantSource || 'resolved_session_tenant',
      isTenantUuidValid: isValidTenantUuid(tenantId),
      questionCount,
      passageCount,
      tenantIdPassedToRepo: tenantId,
    });

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    const result = await importerRepo.importJsonBatch(
      payload,
      session?.userId || 'admin-user',
      tenantId
    );

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      batchCode: result.batchCode,
      importedCount: result.importedCount,
    });
  } catch (err: any) {
    console.error('[IMPORT COMMIT FAILED]:', err);
    const isTenantError =
      err.failingOperation === 'RESOLVE_TENANT_CONTEXT' ||
      err.message?.includes('INVALID_TENANT_CONTEXT') ||
      err.message?.includes('tenant context');

    return NextResponse.json(
      {
        success: false,
        error: isTenantError
          ? 'INVALID_TENANT_CONTEXT'
          : err.message ||
            'The Question Bank could not complete this import. No questions were committed.',
        message: isTenantError
          ? 'A valid authorized tenant context is required for Question Bank import.'
          : err.message,
        referenceCode: isTenantError ? 'INVALID_TENANT_CONTEXT' : 'IMPORT_COMMIT_FAILED',
        errorType: err.code || err.name || 'DATABASE_ERROR',
        dbMessage: err.detail || err.message,
        failingOperation: err.failingOperation || 'IMPORT_COMMIT',
        failingRecord: err.failingRecord || null,
        details: err.message,
      },
      { status: isTenantError ? 400 : 500 }
    );
  }
}
