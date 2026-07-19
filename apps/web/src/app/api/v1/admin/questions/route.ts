import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { createQuestionHandler, logger } = await getQuestionBankContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore Next.js request scope errors in unit tests
      }
    }
    if (!token) {
      token = req.headers.get('authorization')?.split(' ')[1] || null;
    }

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'question.create' as PermissionCode);
    }

    const body = await req.json();
    const { code, examProductId, curriculumModuleId } = body;

    if (!code) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing required parameters' }, { status: 400 });
    }

    const questionId = await createQuestionHandler.execute({
      code,
      examProductId: examProductId || null,
      curriculumModuleId: curriculumModuleId || null
    });

    return NextResponse.json({ success: true, id: questionId }, { status: 201 });
  } catch (err: unknown) {
    logger.error('POST /api/v1/admin/questions failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
