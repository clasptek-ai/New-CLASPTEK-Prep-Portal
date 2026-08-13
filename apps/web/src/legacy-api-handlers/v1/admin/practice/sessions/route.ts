export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalPracticeRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Instructor role
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('exam') || undefined;
    const sectionCode = searchParams.get('section') || undefined;

    const { dbPool } = await getDiagnosticContext();
    const practiceRepo = new PostgresCanonicalPracticeRepository(dbPool.getPool());

    const sessions = await practiceRepo.getAdminSessions({ examType, sectionCode });

    return NextResponse.json({
      success: true,
      totalSessions: sessions.length,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
