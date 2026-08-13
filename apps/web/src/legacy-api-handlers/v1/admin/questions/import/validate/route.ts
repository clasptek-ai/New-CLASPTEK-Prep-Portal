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
    const jsonContent = body.payload || body;
    const targetProgramme = body.targetProgramme || body.examType;

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    const result = importerRepo.validateJsonPayload(jsonContent, targetProgramme);

    return NextResponse.json({
      success: true,
      validation: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
