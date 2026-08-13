import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getAuthContext } from '@/lib/auth-context';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { ProgrammeRegistry } from '@/features/dashboard/models/programme-registry';
import { getCanonicalProgramme } from '@/lib/canonical-programme';

export async function getStudentProfileController(req: NextRequest, _params: Record<string, string>): Promise<NextResponse> {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool, sessionRepo } = await getAuthContext();
    const pool = dbPool.getPool();

    const userRes = await pool.query(
      'SELECT email, raw_user_meta_data, created_at FROM auth.users WHERE id = $1 LIMIT 1',
      [session.userId]
    );
    const profRes = await pool.query(
      'SELECT first_name, last_name, avatar, phone FROM public.profiles WHERE user_id = $1 LIMIT 1',
      [session.userId]
    );

    const au = userRes.rows[0] || {};
    const meta = au.raw_user_meta_data || {};
    const email = au.email || '';

    let firstName =
      profRes.rows[0]?.first_name || meta.first_name || meta.name?.split(' ')[0] || '';
    let lastName =
      profRes.rows[0]?.last_name ||
      meta.last_name ||
      meta.name?.split(' ').slice(1).join(' ') ||
      '';
    const avatarUrl = profRes.rows[0]?.avatar || '/avatars/default.png';
    const phone = profRes.rows[0]?.phone || meta.phone || '';
    const enrolledAt = profRes.rows[0]?.created_at || au.created_at || new Date().toISOString();

    firstName = firstName.trim();
    lastName = lastName.trim();
    const fullName =
      `${firstName} ${lastName}`.trim() || email.split('@')[0] || 'Authenticated User';

    let loginHistory: { ip: string; device: string; timestamp: string }[] = [];
    try {
      const activeSessions = await sessionRepo.findActiveByUserId(session.userId);
      loginHistory = activeSessions.map((s) => ({
        ip: s.ipAddress || '127.0.0.1',
        device: `${s.browser || 'Browser'} / ${s.device || 'Desktop'}`,
        timestamp: s.loginTimestamp
          ? new Date(s.loginTimestamp).toISOString()
          : new Date().toISOString(),
      }));
    } catch {
      loginHistory = [];
    }

    return NextResponse.json({
      id: session.userId,
      name: fullName,
      email,
      avatarUrl,
      phone: phone || '',
      enrolledAt,
      loginHistory,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function getActiveProgrammeController(req: NextRequest, _params: Record<string, string>): Promise<NextResponse> {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');

    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT 
         spe.programme_id as enrollment_programme_id,
         p.target_programme as profile_programme,
         au.raw_user_meta_data->>'programme' as meta_programme,
         COALESCE(spe.target_score::text, au.raw_user_meta_data->>'target_score', au.raw_user_meta_data->>'targetScore', 'Band 7.5+') as target_score
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id OR p.id = au.id
       LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id AND spe.enrollment_status = 'ACTIVE'
       WHERE au.id = $1
       ORDER BY spe.enrolled_at DESC NULLS LAST LIMIT 1`,
      [studentId]
    );

    const row = res.rows[0] || {};
    const rawProgramme = row.enrollment_programme_id || row.profile_programme || row.meta_programme || 'IELTS Academic Prep';
    const programmeConfig = ProgrammeRegistry.get(rawProgramme);

    const skills = programmeConfig.skills.map((s) => s.name);

    return NextResponse.json({
      success: true,
      studentId,
      programmeId: programmeConfig.id,
      programmeTitle: programmeConfig.title,
      examType: programmeConfig.id,
      targetScore: row.target_score || programmeConfig.badge,
      skills,
    });
  } catch (err: any) {
    console.error('GET /api/v1/student/active-programme error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function getCurrentAssessmentController(req: NextRequest, _params: Record<string, string>): Promise<NextResponse> {
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

    const canonicalProg = getCanonicalProgramme(rawProgramme);

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
