export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getCanonicalProgramme } from '@/lib/canonical-programme';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_AUTHENTICATED_USER',
          message: 'User session is not authenticated or has expired.',
        },
        { status: 401 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Resolve student's active enrollment (primary source) with fallback to profile and metadata
    const enrollmentRes = await pool.query(
      `SELECT 
         spe.programme_id as enrollment_programme_id,
         p.target_programme as profile_programme,
         au.raw_user_meta_data->>'programme' as meta_programme
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id OR p.id = au.id
       LEFT JOIN public.student_programme_enrollments spe 
         ON spe.student_id = au.id AND spe.enrollment_status = 'ACTIVE'
       WHERE au.id = $1
       ORDER BY spe.enrolled_at DESC NULLS LAST
       LIMIT 1`,
      [studentId]
    );

    const row = enrollmentRes.rows[0];
    const rawProgramme = row?.enrollment_programme_id || row?.profile_programme || row?.meta_programme;

    if (!rawProgramme) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_ACTIVE_PROGRAMME',
          message: 'No active programme found for your student profile.',
        },
        { status: 404 }
      );
    }

    // 2. Resolve canonical programme identity via shared helper
    const canonicalProg = getCanonicalProgramme(rawProgramme);

    // 3. Check for active IN_PROGRESS attempt for candidate
    let hasActiveAttempt = false;
    let activeAttemptId: string | null = null;

    const activeRes = await pool.query(
      `SELECT id FROM public.assessment_attempts 
       WHERE student_id = $1 
         AND status = 'IN_PROGRESS' 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND deleted_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [studentId]
    );

    if (activeRes.rows.length > 0) {
      hasActiveAttempt = true;
      activeAttemptId = activeRes.rows[0].id;
    }

    // 4. Query active assigned PUBLISHED diagnostic assessment for programme using canonical ID or aliases
    const assignRes = await pool.query(
      `SELECT 
        ad.id,
        ad.code,
        ad.title,
        ad.exam_type as "examType",
        ad.duration_minutes as "durationMinutes",
        ad.status,
        ad.instructions,
        ad.sections_config as "sectionsConfig",
        ad.published_at as "publishedAt",
        paa.programme_id as "assignedProgramme"
      FROM public.programme_assessment_assignments paa
      JOIN public.assessment_definitions ad ON ad.id = paa.assessment_definition_id
      WHERE paa.programme_id = ANY($1::text[])
        AND paa.assessment_type = 'DIAGNOSTIC'
        AND paa.is_active = true
        AND ad.status = 'PUBLISHED'
      LIMIT 1`,
      [canonicalProg.aliases]
    );

    let definition = assignRes.rows[0];

    // Fallback: Query assessment_definitions by exam_type matching canonical aliases
    if (!definition) {
      const defRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE exam_type = ANY($1::text[])
          AND assessment_type = 'DIAGNOSTIC'
          AND status = 'PUBLISHED'
        ORDER BY created_at DESC LIMIT 1`,
        [canonicalProg.aliases]
      );
      definition = defRes.rows[0];
    }

    // Secondary fallback: Default published placement assessment
    if (!definition) {
      const defaultRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE (code = 'ENG-PROF-DIAG' OR assessment_type = 'DIAGNOSTIC') AND status = 'PUBLISHED'
        ORDER BY created_at DESC LIMIT 1`
      );
      definition = defaultRes.rows[0];
    }

    if (!definition) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_PUBLISHED_DIAGNOSTIC',
          message: 'No diagnostic assessment is currently assigned to your programme.',
        },
        { status: 404 }
      );
    }

    // Dynamic section outline resolution based on canonical assessment configuration
    const rawSections = definition.sectionsConfig || [
      { code: 'GRAMMAR', name: 'Structure & Grammar', questionCount: 30 },
      { code: 'READING', name: 'Reading Comprehension', questionCount: 5, passages: 1 },
      { code: 'WRITING', name: 'Writing Expression', questionCount: 2, tasks: ['TASK1', 'TASK2'] },
    ];

    const sections = rawSections.map((sec: any) => ({
      code: sec.code || sec.name,
      name: sec.name || sec.code,
      questionCount:
        sec.questionCount || (sec.passages ? sec.passages * 5 : sec.tasks ? sec.tasks.length : 1),
    }));

    const totalQuestions = sections.reduce(
      (acc: number, curr: any) => acc + (curr.questionCount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      hasActiveAttempt,
      activeAttemptId,
      assessment: {
        id: definition.id,
        code: definition.code,
        title: definition.title,
        type: 'Placement Diagnostic',
        durationMinutes: definition.durationMinutes || 45,
        totalQuestions,
        instructions:
          definition.instructions ||
          'Complete all sections independently within the allocated duration in a quiet environment.',
        sections,
      },
      programme: {
        id: canonicalProg.id,
        name: canonicalProg.title,
        examType: canonicalProg.id,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/student/current-assessment error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'ASSESSMENT_LOOKUP_FAILED',
        message: 'Unable to load your diagnostic. Please try again.',
      },
      { status: 500 }
    );
  }
}


