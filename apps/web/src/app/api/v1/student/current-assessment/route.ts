export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const requestId = require('crypto').randomUUID();

    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Resolve student's target programme
    let studentProgramme = 'English Proficiency';
    if (studentId) {
      const profileRes = await pool
        .query(`SELECT target_programme FROM public.profiles WHERE user_id = $1 OR id = $1`, [
          studentId,
        ])
        .catch(() => null);
      if (profileRes && profileRes.rows.length > 0 && profileRes.rows[0].target_programme) {
        studentProgramme = profileRes.rows[0].target_programme;
      }
    }

    // 2. Check for active IN_PROGRESS attempt for candidate
    let hasActiveAttempt = false;
    let activeAttemptId: string | null = null;

    if (studentId) {
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
    }

    // 3. Query active assigned PUBLISHED assessment definition for programme
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
      WHERE paa.programme_id = $1 
        AND paa.is_active = true
        AND ad.status = 'PUBLISHED'
      LIMIT 1`,
      [studentProgramme]
    );

    let definition = assignRes.rows[0];

    // Fallback: If no assignment, query default published definition
    if (!definition) {
      const defRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE exam_type = $1 AND status = 'PUBLISHED'
        ORDER BY created_at DESC LIMIT 1`,
        [studentProgramme]
      );
      definition = defRes.rows[0];
    }

    // Secondary fallback: English Proficiency Placement Assessment
    if (!definition) {
      const defaultRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE code = 'ENG-PROF-DIAG' AND status = 'PUBLISHED'
        LIMIT 1`
      );
      definition = defaultRes.rows[0];
    }

    if (!definition) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_PUBLISHED_ASSESSMENT',
          message: 'No published assessment found for your programme.',
        },
        { status: 404 }
      );
    }

    const rawSections = definition.sectionsConfig || [
      { code: 'GRAMMAR', name: 'Grammar & Structure', questionCount: 30, selection: 'BALANCED' },
      { code: 'READING', name: 'Reading Comprehension', passages: 1 },
      { code: 'WRITING', name: 'Writing Expression', tasks: ['ESSAY', 'LETTER'] },
    ];

    const sections = rawSections.map((sec: any) => ({
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
      data: {
        hasActiveAttempt,
        activeAttemptId,
        assessment: {
          id: definition.id,
          code: definition.code,
          title: definition.title,
          description: `Official placement assessment for ${studentProgramme}`,
          instructions:
            definition.instructions || 'Complete all sections within the allocated duration.',
          durationMinutes: definition.durationMinutes || 45,
          totalQuestions,
          programme: {
            id: studentProgramme.toLowerCase().replace(/\s+/g, '-'),
            name: studentProgramme,
          },
          sections,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/student/current-assessment error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
