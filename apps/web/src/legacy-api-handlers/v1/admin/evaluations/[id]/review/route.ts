export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresSubjectiveEvaluationRepository } from '@clasptek/persistence';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const reviewerId = session?.userId || req.headers.get('x-reviewer-id') || 'admin-001';

    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id: evaluationId } = await params;
    const body = await req.json();
    const { adjustedScore, scoreLabel, notes } = body;

    if (adjustedScore === undefined || !scoreLabel) {
      return NextResponse.json(
        { error: 'MISSING_REQUIRED_FIELDS', message: 'adjustedScore and scoreLabel are required.' },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const evalRepo = new PostgresSubjectiveEvaluationRepository(dbPool.getPool());

    await evalRepo.reviewEvaluation(
      evaluationId,
      reviewerId,
      parseFloat(adjustedScore),
      scoreLabel,
      notes || 'Human review completed and score verified.'
    );

    return NextResponse.json({
      success: true,
      evaluationId,
      status: 'COMPLETED',
      evaluationMethod: 'HYBRID',
      adjustedScore,
      scoreLabel,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
