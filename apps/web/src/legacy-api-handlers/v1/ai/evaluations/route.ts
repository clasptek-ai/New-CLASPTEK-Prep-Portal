export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import type { EvaluationJobStatus, QuestionType } from '@clasptek/domain-ai-evaluation';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER', 'INSTRUCTOR'];

/**
 * GET /api/v1/ai/evaluations
 *
 * Search / list evaluation jobs across all students.
 * Requires ADMIN, SUPER_ADMIN, ADMINISTRATOR, EXAMINER, or INSTRUCTOR role.
 * Students are redirected to /api/v1/evaluations (student-scoped).
 *
 * Query: ?studentId=&submissionId=&status=&questionType=&limit=&offset=
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isPrivileged = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isPrivileged) {
      return NextResponse.json(
        { error: 'Forbidden: requires ADMIN, SUPER_ADMIN, EXAMINER, or INSTRUCTOR role' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ctx = getAiEvaluationContext();

    const jobs = await ctx.searchEvaluations.execute({
      studentId: searchParams.get('studentId') ?? undefined,
      submissionId: searchParams.get('submissionId') ?? undefined,
      status: (searchParams.get('status') as unknown as EvaluationJobStatus) ?? undefined,
      questionType: (searchParams.get('questionType') as unknown as QuestionType) ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
