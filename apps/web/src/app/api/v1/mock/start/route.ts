export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const examType = body.exam || body.examType || 'IELTS Academic';
    const blueprintId = body.blueprintId;

    const { dbPool } = await getDiagnosticContext();
    const mockRepo = new PostgresCanonicalMockRepository(dbPool.getPool());

    // 1. Load active blueprint
    let bp = blueprintId
      ? await mockRepo.getSessionById(blueprintId) // check if ID passed is blueprint
      : null;

    if (!bp) {
      bp = await mockRepo.getBlueprintByExamType(examType);
    }

    if (!bp) {
      return NextResponse.json(
        { error: 'NO_ACTIVE_MOCK_BLUEPRINT', message: `No active blueprint found for ${examType}.` },
        { status: 404 }
      );
    }

    // 2. Validate inventory
    const validation = await mockRepo.validateBlueprintInventory(bp);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'BLUEPRINT_INVENTORY_INSUFFICIENT',
          message: `Universal Question Bank cannot satisfy blueprint requirements for ${bp.title}.`,
          deficits: validation.deficits,
        },
        { status: 422 }
      );
    }

    // 3. Query eligible MOCK questions
    const mockQuestions = await mockRepo.queryMockQuestionsForBlueprint(bp);
    if (mockQuestions.length === 0) {
      return NextResponse.json(
        { error: 'BLUEPRINT_INVENTORY_INSUFFICIENT', message: 'No eligible MOCK questions available.' },
        { status: 422 }
      );
    }

    // 4. Calculate server-authoritative timer
    const totalMinutes = bp.sections.reduce((acc: number, s: any) => acc + (s.timeLimitMinutes || 30), 0);
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + totalMinutes * 60 * 1000);
    const sessionId = randomUUID();

    // 5. Insert mock_sessions record
    await mockRepo.createMockSession({
      id: sessionId,
      studentId,
      examType: bp.examType,
      blueprintId: bp.id,
      status: 'IN_PROGRESS',
      evaluationState: 'IN_PROGRESS',
      currentSectionIndex: 0,
      timeRemainingSeconds: totalMinutes * 60,
      startedAt,
      expiresAt,
    });

    // 6. Save question snapshots
    await mockRepo.saveMockQuestionSnapshots(sessionId, mockQuestions);

    // Group questions by section for player rendering
    const sections = bp.sections.map((sec: any) => ({
      name: sec.name,
      orderIndex: sec.orderIndex,
      timeLimitMinutes: sec.timeLimitMinutes,
      questions: mockQuestions.filter((q) => q.sectionName === sec.name),
    }));

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        studentId,
        examType: bp.examType,
        blueprintId: bp.id,
        title: bp.title,
        status: 'IN_PROGRESS',
        startedAt,
        expiresAt,
        totalDurationMinutes: totalMinutes,
        sections,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
