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
    questionType
  });

  return NextResponse.json(questions.map(q => ({
    id: q.id,
    code: q.code.value,
    examProductId: q.examProductId,
    curriculumModuleId: q.curriculumModuleId,
    status: q.status
  })));
}
