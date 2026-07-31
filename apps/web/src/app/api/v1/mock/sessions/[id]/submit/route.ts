export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';
import { ExamPluginRegistry } from '@/features/plugins/registry/exam-plugin.registry';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const answers = body.answers || {};

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const mockRepo = new PostgresCanonicalMockRepository(pool);

    const sessionRecord = await mockRepo.getSessionById(sessionId);
    if (!sessionRecord) {
      return NextResponse.json({ error: 'Mock session not found' }, { status: 404 });
    }

    // Verify session ownership
    if (sessionRecord.student_id !== studentId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    // Idempotency check
    if (sessionRecord.status === 'SUBMITTED' || sessionRecord.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'Mock session already submitted',
        sessionId,
        status: sessionRecord.status,
        officialScoreLabel: sessionRecord.official_score_label || 'Estimated Mock Score',
      });
    }

    // Score objective items server-side against answer_options
    let correctCount = 0;
    const answerEntries = Object.entries(answers);
    const totalQuestions = answerEntries.length || 40;

    let hasPendingSubjective = false;

    for (const [qId, ans] of answerEntries) {
      const qAns = ans as any;
      const userCode = qAns.studentAnswer || qAns.selectedOptionCode;
      const itemType = qAns.itemType || 'MCQ';

      if (itemType === 'ESSAY' || itemType === 'SPEAKING_PROMPT' || itemType === 'WRITING') {
        hasPendingSubjective = true;
      } else if (userCode) {
        const isCorrect = await mockRepo.evaluateObjectiveAnswer(qId, userCode);
        if (isCorrect) correctCount++;
      }
    }

    const scorePercentage = parseFloat(((correctCount / totalQuestions) * 100).toFixed(2));
    const examType = sessionRecord.exam_type || 'IELTS Academic';

    // Delegate official scale conversion to ExamPluginRegistry
    const plugin = ExamPluginRegistry.getPlugin(examType);
    const conversion = plugin.calculateOverallScore(correctCount, totalQuestions);

    const evaluationState = hasPendingSubjective ? 'EVALUATING' : 'COMPLETED';
    const officialScoreLabel = hasPendingSubjective
      ? `Estimated Mock Score: ${conversion.bandOrScale} (Subjective Pending)`
      : `Estimated Mock Score: ${conversion.bandOrScale}`;

    const submittedAt = new Date();

    const scaledScore = typeof conversion.overallScore === 'number'
      ? conversion.overallScore
      : parseFloat(String(conversion.overallScore || 0));

    // Update canonical mock_sessions & mock_results in PostgreSQL
    await mockRepo.updateMockSessionResult(sessionId, {
      status: 'SUBMITTED',
      evaluationState,
      scorePercentage,
      officialScaledScore: scaledScore,
      officialScoreLabel,
      submittedAt,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'SUBMITTED',
      evaluationState,
      scorePercentage,
      officialScaledScore: conversion.overallScore,
      officialScoreLabel,
      cefrLevel: conversion.cefrLevel,
      submittedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
