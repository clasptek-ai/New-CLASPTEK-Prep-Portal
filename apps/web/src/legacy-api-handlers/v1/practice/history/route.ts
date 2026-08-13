export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalPracticeRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool } = await getDiagnosticContext();
    const practiceRepo = new PostgresCanonicalPracticeRepository(dbPool.getPool());

    const history = await practiceRepo.getStudentHistory(studentId);

    return NextResponse.json({
      success: true,
      totalSessions: history.length,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
