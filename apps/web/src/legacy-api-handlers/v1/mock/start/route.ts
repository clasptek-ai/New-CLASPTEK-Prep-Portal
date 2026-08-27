export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getStudentAssessmentState } from '@/lib/student-assessment-state';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      session?.tenantId || req.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000000';

    const body = await req.json().catch(() => ({}));
    const requestedExamType = body.exam || body.examType;
    const blueprintId = body.blueprintId;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const mockRepo = new PostgresCanonicalMockRepository(pool);

    // 1. Resolve Blueprint by ID or Exam Type
    let bp = null;
    if (blueprintId) {
      const cleanBpId = String(blueprintId).replace(/^(tmpl-|bp-)/, '');
      bp = await mockRepo.getBlueprintById(cleanBpId);

      // Check if blueprint exists in DB but is locked/inactive
      if (!bp) {
        const rawCheck = await pool.query(
          `SELECT id, status, title FROM public.mock_blueprints WHERE id::text = $1 OR exam_code = $1`,
          [cleanBpId]
        );
        if (
          rawCheck.rows.length > 0 &&
          rawCheck.rows[0].status !== 'PUBLISHED' &&
          rawCheck.rows[0].status !== 'APPROVED'
        ) {
          return NextResponse.json(
            {
              error: 'MOCK_EXAM_LOCKED',
              message: `The mock examination "${rawCheck.rows[0].title}" is currently locked by the administrator and is unavailable for student attempts.`,
            },
            { status: 403 }
          );
        }
      }
    }

    if (!bp && requestedExamType) {
      bp = await mockRepo.getBlueprintByExamType(requestedExamType);
    }

    if (!bp) {
      return NextResponse.json(
        {
          error: 'NO_ACTIVE_MOCK_BLUEPRINT',
          message: `No active or published mock blueprint found for ${requestedExamType || 'the requested examination'}.`,
        },
        { status: 404 }
      );
    }

    const effectiveExamType = bp.examType || requestedExamType || 'IELTS Academic';

    // 2. Server-side Programme Authorization Check
    const userRes = await pool.query(
      `SELECT au.raw_user_meta_data, au.raw_app_meta_data,
              p.target_programme,
              COALESCE(
                json_agg(DISTINCT ep.name) FILTER (WHERE ep.name IS NOT NULL),
                '[]'::json
              ) as enrolled_product_names,
              COALESCE(
                json_agg(DISTINCT ep.code) FILTER (WHERE ep.code IS NOT NULL),
                '[]'::json
              ) as enrolled_product_codes
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id
       LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id AND spe.deleted_at IS NULL
       LEFT JOIN public.exam_products ep ON ep.id = spe.programme_id
       WHERE au.id = $1
       GROUP BY au.id, p.target_programme`,
      [studentId]
    );

    const userRow = userRes.rows[0];
    const userRole = (
      userRow?.raw_user_meta_data?.role ||
      userRow?.raw_app_meta_data?.role ||
      ''
    ).toLowerCase();
    const isStaffOrAdmin = ['admin', 'superadmin', 'instructor', 'evaluator', 'staff'].includes(
      userRole
    );

    if (!isStaffOrAdmin) {
      // 2a. Pre-Assessment Gating: Student must complete Pre-Assessment before starting a Mock Exam
      const assessmentState = await getStudentAssessmentState(pool, studentId);
      if (!assessmentState.hasCompletedPreAssessment) {
        return NextResponse.json(
          {
            error: 'PRE_ASSESSMENT_REQUIRED',
            message: 'You must complete your diagnostic Pre-Assessment before attempting Mock Examinations.',
            preAssessmentState: assessmentState.state,
          },
          { status: 403 }
        );
      }
      const enrolledNames: string[] = userRow?.enrolled_product_names || [];
      const enrolledCodes: string[] = userRow?.enrolled_product_codes || [];
      const targetProgramme = userRow?.target_programme || userRow?.raw_user_meta_data?.programme;

      const authorizedProgrammes = [...enrolledNames, ...enrolledCodes];
      if (targetProgramme) authorizedProgrammes.push(targetProgramme);

      if (authorizedProgrammes.length > 0) {
        const normalizedReq = effectiveExamType.toUpperCase().replace(/[^A-Z]/g, '');

        const hasAccess = authorizedProgrammes.some((prog) => {
          const norm = prog.toUpperCase().replace(/[^A-Z]/g, '');
          if (norm === normalizedReq) return true;
          if (
            norm.includes('ALL') ||
            norm.includes('UNRESTRICTED') ||
            norm.includes('FULLACCESS')
          ) {
            return true;
          }
          // IELTS matching: matches IELTS Academic, IELTS General, and IELTS prep titles (e.g. Band 7 Prep)
          if (
            (norm.includes('IELTS') || norm.includes('BAND')) &&
            (normalizedReq.includes('IELTS') || normalizedReq.includes('BAND'))
          ) {
            return true;
          }
          // TOEFL matching
          if (norm.includes('TOEFL') && normalizedReq.includes('TOEFL')) return true;
          // SAT matching
          if (norm.includes('SAT') && normalizedReq.includes('SAT')) return true;
          // CELPIP matching
          if (norm.includes('CELPIP') && normalizedReq.includes('CELPIP')) return true;
          // English Proficiency matching
          if (
            (norm.includes('ENG') || norm.includes('PROFICIENCY') || norm.includes('GENERAL')) &&
            (normalizedReq.includes('ENG') ||
              normalizedReq.includes('PROFICIENCY') ||
              normalizedReq.includes('GENERAL'))
          ) {
            return true;
          }
          return false;
        });

        if (!hasAccess) {
          return NextResponse.json(
            {
              error: 'FORBIDDEN_PROGRAMME_ACCESS',
              message: `You are registered for ${authorizedProgrammes.join(', ')} and cannot access mock examinations for ${effectiveExamType}.`,
            },
            { status: 403 }
          );
        }
      }
    }

    // 3. Validate inventory
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

    // 4. Query eligible MOCK questions with attempt-aware student history exclusion
    const mockQuestions = await mockRepo.queryMockQuestionsForBlueprint(bp, studentId);
    if (mockQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'BLUEPRINT_INVENTORY_INSUFFICIENT',
          message: 'No eligible MOCK questions available.',
        },
        { status: 422 }
      );
    }

    // 5. Calculate server-authoritative timer
    const totalMinutes = bp.sections.reduce(
      (acc: number, s: any) => acc + (s.timeLimitMinutes || 30),
      0
    );
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + totalMinutes * 60 * 1000);
    const sessionId = randomUUID();

    // 6. Insert mock_sessions record
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
      tenantId,
    });

    // 7. Save question snapshots
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
