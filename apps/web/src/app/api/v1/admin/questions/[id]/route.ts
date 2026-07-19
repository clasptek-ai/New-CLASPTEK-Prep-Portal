import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { ApplicationError } from '@clasptek/kernel';
import { SemanticVersion } from '@clasptek/domain-question-bank';

export async function PATCH(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getQuestionHandler, questionRepo, logger } = await getQuestionBankContext();
  try {
    let token: string | null = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('sb-access-token')?.value || null;
      } catch {
        // ignore in tests
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
    const question = await getQuestionHandler.execute(id);
    if (!question) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Question not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, versionNo, optId, optCode, optText, isCorrect, displayOrder, solId, explanation, incorrectExplanation, hint, referenceUrl, teachingNote, rubId, criteria, maxPoints, description } = body;

    const verNoVo = versionNo ? new SemanticVersion(versionNo) : null;

    if (action === 'addAnswerOption') {
      if (!verNoVo || !optId || !optCode || !optText || displayOrder === undefined) {
        return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing option parameters' }, { status: 400 });
      }
      question.addAnswerOption(verNoVo, optId, optCode, optText, isCorrect, displayOrder);
    } else if (action === 'setSolution') {
      if (!verNoVo || !solId || !explanation) {
        return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing solution parameters' }, { status: 400 });
      }
      question.setSolution(verNoVo, solId, explanation, incorrectExplanation || '', hint || '', referenceUrl || '', teachingNote || '');
    } else if (action === 'setRubric') {
      if (!verNoVo || !rubId || !criteria || maxPoints === undefined) {
        return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing rubric parameters' }, { status: 400 });
      }
      question.setRubric(verNoVo, rubId, criteria, maxPoints, description || '');
    } else {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Invalid action parameter' }, { status: 400 });
    }

    await questionRepo.save(question);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error('PATCH /api/v1/admin/questions/[id] failure', err instanceof Error ? err : new Error(String(err)));
    if (err instanceof ApplicationError) {
      return NextResponse.json({ code: err.name, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
