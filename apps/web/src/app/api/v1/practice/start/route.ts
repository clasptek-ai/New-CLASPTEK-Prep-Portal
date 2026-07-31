export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalPracticeRepository } from '@clasptek/persistence';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const examType = body.exam || body.examType || 'English Proficiency';
    const sectionCode = body.section || body.sectionCode || 'Grammar';
    const skillCode = body.skill || body.skillCode || 'General';
    const difficulty = body.difficulty || 'MEDIUM';
    const questionCount = typeof body.questionCount === 'number' ? body.questionCount : 10;
    const mode = body.mode || 'IMMEDIATE_FEEDBACK';

    const { dbPool } = await getDiagnosticContext();
    const practiceRepo = new PostgresCanonicalPracticeRepository(dbPool.getPool());

    // 1. Query eligible PRACTICE questions from Universal Question Bank
    const eligibleQuestions = await practiceRepo.queryEligibleQuestions({
      examType,
      sectionCode,
      skillCode,
      difficulty,
      questionCount,
    });

    if (eligibleQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_QUESTION_INVENTORY',
          message: `No published PRACTICE questions match criteria: ${examType} - ${sectionCode} (${difficulty}).`,
          examType,
          sectionCode,
          difficulty,
        },
        { status: 422 }
      );
    }

    // 2. Create Practice Session record
    const sessionId = randomUUID();
    const startedAt = new Date();

    await practiceRepo.createSession({
      id: sessionId,
      studentId,
      examType,
      sectionCode,
      skillCode,
      difficulty,
      totalQuestions: eligibleQuestions.length,
      mode,
      status: 'ACTIVE',
      startedAt,
    });

    // 3. Snapshot exact question versions in practice_session_questions
    await practiceRepo.saveSessionQuestionSnapshots(sessionId, eligibleQuestions);

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        exam: examType,
        section: sectionCode,
        skill: skillCode,
        difficulty,
        totalQuestions: eligibleQuestions.length,
        questions: eligibleQuestions,
        mode,
        startedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
