export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresSubjectiveEvaluationRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const skill = searchParams.get('skill') || undefined;

    const { dbPool } = await getDiagnosticContext();
    const evalRepo = new PostgresSubjectiveEvaluationRepository(dbPool.getPool());

    const evaluations = await evalRepo.getAdminEvaluations({ status, skill });

    return NextResponse.json({
      success: true,
      totalEvaluations: evaluations.length,
      evaluations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
