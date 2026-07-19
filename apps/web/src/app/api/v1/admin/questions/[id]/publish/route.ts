import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { publishQuestionHandler, logger } = await getQuestionBankContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'question.publish' as PermissionCode);
    }

    const { id } = await _params.params;
    const body = await req.json();
    const { versionNo } = body;

    if (!versionNo) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing versionNo' }, { status: 400 });
    }

    await publishQuestionHandler.execute({
      questionId: id,
      versionNo
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/questions/[id]/publish failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
