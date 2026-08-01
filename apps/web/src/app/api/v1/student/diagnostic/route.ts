export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Resolve student's target programme from DB or default to 'English Proficiency'
    let studentProgramme = 'English Proficiency';
    if (studentId) {
      const profileRes = await pool.query(
        `SELECT target_programme FROM public.profiles WHERE user_id = $1 OR id = $1`,
        [studentId]
      ).catch(() => null);
      if (profileRes && profileRes.rows.length > 0 && profileRes.rows[0].target_programme) {
        studentProgramme = profileRes.rows[0].target_programme;
      }
    }

    // 2. Query active published diagnostic assigned to student's programme
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
        AND paa.assessment_type = 'DIAGNOSTIC'
        AND paa.is_active = true
        AND ad.status = 'PUBLISHED'
      LIMIT 1`,
      [studentProgramme]
    );

    let diagnostic = assignRes.rows[0];

    // Fallback: If no custom assignment yet, query default published diagnostic for programme
    if (!diagnostic) {
      const defRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE exam_type = $1 AND assessment_type = 'DIAGNOSTIC' AND status = 'PUBLISHED'
        ORDER BY created_at DESC LIMIT 1`,
        [studentProgramme]
      );
      diagnostic = defRes.rows[0];
    }

    // Secondary Fallback: English Proficiency Placement Assessment
    if (!diagnostic) {
      const defaultRes = await pool.query(
        `SELECT 
          id, code, title, exam_type as "examType", duration_minutes as "durationMinutes",
          status, instructions, sections_config as "sectionsConfig", published_at as "publishedAt"
        FROM public.assessment_definitions
        WHERE code = 'ENG-PROF-DIAG' AND status = 'PUBLISHED'
        LIMIT 1`
      );
      diagnostic = defaultRes.rows[0];
    }

    if (!diagnostic) {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_DIAGNOSTIC', message: 'No active published diagnostic assessment found for your programme.' },
        { status: 404 }
      );
    }

    const sections = diagnostic.sectionsConfig || [
      { code: 'GRAMMAR', name: 'Grammar & Structure', questionCount: 30, selection: 'BALANCED' },
      { code: 'READING', name: 'Reading Comprehension', passages: 1 },
      { code: 'WRITING', name: 'Writing Expression', tasks: ['ESSAY', 'LETTER'] },
    ];

    return NextResponse.json({
      success: true,
      data: {
        id: diagnostic.id,
        code: diagnostic.code,
        title: diagnostic.title,
        examType: diagnostic.examType || studentProgramme,
        durationMinutes: diagnostic.durationMinutes || 45,
        status: diagnostic.status,
        instructions: diagnostic.instructions,
        sections,
        assignedProgramme: studentProgramme,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/student/diagnostic error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
