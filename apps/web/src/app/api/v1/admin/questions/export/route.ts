export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { CanonicalJsonImporterRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('examType') || undefined;
    const status = searchParams.get('status') || undefined;

    const { dbPool } = await getDiagnosticContext();
    const importerRepo = new CanonicalJsonImporterRepository(dbPool.getPool());

    const exportContract = await importerRepo.exportJsonBank({ examType, status });

    return new NextResponse(JSON.stringify(exportContract, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="clasptek_question_bank_export_${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
