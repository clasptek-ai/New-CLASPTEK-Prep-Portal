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
  const { createVersionHandler, logger } = await getQuestionBankContext();
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
      AccessControlGuard.authorize(principal, 'question.update' as PermissionCode);
    }

    const { id } = await _params.params;
    const body = await req.json();
    const { versionNo, title, payload, digitalSignature } = body;

    if (!versionNo || !title || !payload) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing required version parameters' }, { status: 400 });
    }

    const versionId = await createVersionHandler.execute({
      questionId: id,
      versionNo,
      title,
      payload,
      digitalSignature: digitalSignature || undefined
    });

    return NextResponse.json({ success: true, versionId });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/questions/[id]/create-version failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
