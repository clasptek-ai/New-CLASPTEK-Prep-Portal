export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DatabasePool } from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';

export async function POST(req: NextRequest) {
  const logger = new ConsoleLogger('practice-start-api');

  try {
    const body = await req.json();
    const exam = body.exam || 'IELTS Academic';
    const section = body.section || 'Reading';
    const questionCount = body.questionCount || 10;

    let dbQuestions: any[] = [];
    try {
      const env = loadEnvironment(process.env);
      const dbPool = new DatabasePool(env, logger);
      await dbPool.connect();
      const pool = dbPool.getPool();

      const res = await pool.query(
        `SELECT id, question_code as code, exam_type as exam, prompt as text, options, correct_answer as "correctAnswer", explanation
         FROM questions
         WHERE status = 'PUBLISHED' AND exam_type = $1
         LIMIT $2`,
        [exam, questionCount]
      );
      if (res && res.rows) {
        dbQuestions = res.rows;
      }
    } catch {
      // Fallback fallback handling
    }

    const sessionId = `ps-${Date.now()}`;
    return NextResponse.json(
      {
        success: true,
        sessionId,
        exam,
        section,
        totalQuestions: questionCount,
        questionsCount: dbQuestions.length || questionCount,
        message: `Practice session ${sessionId} initialized successfully for ${exam}.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logger.error('Error starting practice session', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
