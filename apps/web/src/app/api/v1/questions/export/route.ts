export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getQuestionBankContext } from '@/lib/question-bank-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const ctx = await getQuestionBankContext();
    const questions = await ctx.searchQuestionsHandler.execute({});

    if (format === 'csv') {
      const header = 'id,code,status\n';
      const rows = questions
        .map(
          (q) => `${q.id},${typeof q.code === 'string' ? q.code : (q.code as any)?.value},published`
        )
        .join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="question-export.csv"',
        },
      });
    }

    return NextResponse.json({
      exportDate: new Date().toISOString(),
      count: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        code: typeof q.code === 'string' ? q.code : (q.code as any)?.value,
        status: 'published',
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
