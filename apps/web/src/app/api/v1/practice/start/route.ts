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

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 0. SECURITY & PROGRAMME CONTEXT: Resolve student's active programme & exam directly from backend DB
    const profileRes = await pool.query(
      `SELECT 
         COALESCE(spe.programme_id::text, p.target_programme, au.raw_user_meta_data->>'programme', 'IELTS Academic') as programme_title
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id
       LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id AND spe.enrollment_status = 'ACTIVE'
       WHERE au.id = $1
       ORDER BY spe.enrolled_at DESC LIMIT 1`,
      [studentId]
    );

    const progTitle = (profileRes.rows[0]?.programme_title || 'IELTS Academic').toUpperCase();
    let derivedExamType = 'IELTS Academic';
    if (progTitle.includes('TOEFL')) derivedExamType = 'TOEFL iBT';
    else if (progTitle.includes('SAT')) derivedExamType = 'SAT';
    else if (progTitle.includes('ENGLISH PROFICIENCY') || progTitle.includes('GENERAL')) derivedExamType = 'English Proficiency';
    else if (progTitle.includes('CELPIP')) derivedExamType = 'CELPIP';

    const body = await req.json();
    const sectionCode = body.section || body.sectionCode || 'Reading';
    const skillCode = body.skill || body.skillCode || `${sectionCode} Practice`;
    const difficulty = body.difficulty || 'MEDIUM';
    const questionCount = typeof body.questionCount === 'number' ? body.questionCount : 10;
    const mode = body.mode || 'IMMEDIATE_FEEDBACK';

    const practiceRepo = new PostgresCanonicalPracticeRepository(pool);

    // 1. Query eligible PRACTICE questions filtered by student's ACTIVE EXAM TYPE
    const eligibleQuestions = await practiceRepo.queryEligibleQuestions({
      examType: derivedExamType,
      sectionCode,
      skillCode,
      difficulty,
      questionCount,
      studentId,
    });

    if (eligibleQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_QUESTION_INVENTORY',
          message: 'Not enough practice questions are currently available for this skill.',
          examType: derivedExamType,
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
      examType: derivedExamType,
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
        exam: derivedExamType,
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
