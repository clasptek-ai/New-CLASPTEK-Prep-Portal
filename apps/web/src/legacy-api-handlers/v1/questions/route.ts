export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getQuestionBankContext } from '@/lib/question-bank-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  const { searchQuestionsHandler } = await getQuestionBankContext();
  const searchParams = req.nextUrl.searchParams;

  const examProductId = searchParams.get('examProductId') || undefined;
  const curriculumModuleId = searchParams.get('curriculumModuleId') || undefined;
  const status = searchParams.get('status') || undefined;

  const questions = await searchQuestionsHandler.execute({
    examProductId,
    curriculumModuleId,
    status,
  });

  return NextResponse.json(
    questions.map((q) => ({
      id: q.id,
      code: typeof q.code === 'string' ? q.code : (q.code as any)?.value,
      examProductId: null,
      curriculumModuleId: null,
      status: 'published',
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { code, title, examProductId, difficulty = 'MEDIUM' } = body;

    if (!code) {
      return NextResponse.json({ error: 'Missing required field: code' }, { status: 400 });
    }

    const ctx = await getQuestionBankContext();
    const id = await ctx.createQuestionHandler.execute({
      code,
      examProductId: examProductId || null,
      curriculumModuleId: null,
    });

    return NextResponse.json(
      {
        id,
        code,
        title: title || code,
        status: 'draft',
        difficulty,
        message: 'Question package created successfully',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
