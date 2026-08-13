export const dynamic = 'force-dynamic';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getQuestionBankContext } from '@/lib/question-bank-context';

export async function GET(req: NextRequest) {
  const { searchQuestionsHandler } = await getQuestionBankContext();
  const searchParams = req.nextUrl.searchParams;

  const examProductId = searchParams.get('examProductId') || undefined;
  const curriculumModuleId = searchParams.get('curriculumModuleId') || undefined;
  const status = searchParams.get('status') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const language = searchParams.get('language') || undefined;
  const questionType = searchParams.get('questionType') || undefined;

  const questions = await searchQuestionsHandler.execute({
    examProductId,
    curriculumModuleId,
    status,
    difficulty,
    language,
    questionType,
  } as any);

  return NextResponse.json(
    questions.map((q: any) => ({
      id: q.id,
      code: typeof q.code === 'string' ? q.code : q.code?.value,
      examProductId: q.examProductId || null,
      curriculumModuleId: q.curriculumModuleId || null,
      status: q.status || 'published',
    }))
  );
}
