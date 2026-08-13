export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { importQuestionsHandler, logger } = await getQuestionBankContext();
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
      AccessControlGuard.authorize(principal, 'question.create' as PermissionCode);
    }

    const body = await req.json();
    const { payloads } = body;

    if (!payloads || !Array.isArray(payloads)) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing payloads array' },
        { status: 400 }
      );
    }

    const ids = await importQuestionsHandler.execute({ payloads });

    return NextResponse.json({ success: true, importedIds: ids });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/admin/questions/bulk-import failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
