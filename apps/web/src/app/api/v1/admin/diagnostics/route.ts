export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const query = `
      SELECT 
        ad.id,
        ad.code,
        ad.title,
        ad.exam_type as "examType",
        ad.assessment_type as "assessmentType",
        ad.duration_minutes as "durationMinutes",
        ad.status,
        ad.instructions,
        ad.sections_config as "sectionsConfig",
        ad.shuffle_questions as "shuffleQuestions",
        ad.shuffle_answers as "shuffleAnswers",
        ad.published_at as "publishedAt",
        ad.created_at as "createdAt",
        paa.programme_id as "assignedProgramme"
      FROM public.assessment_definitions ad
      LEFT JOIN public.programme_assessment_assignments paa 
        ON paa.assessment_definition_id = ad.id AND paa.is_active = true
      WHERE ad.assessment_type = 'DIAGNOSTIC'
      ORDER BY ad.created_at DESC
    `;

    const res = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/diagnostics error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json();
    const {
      title,
      examType = 'English Proficiency',
      durationMinutes = 45,
      sectionsConfig,
      instructions = 'Complete all sections within the allocated time limit.',
      assignedProgramme,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const id = randomUUID();
    const code = `DIAG-${Date.now().toString(36).toUpperCase()}`;

    const defaultSections = sectionsConfig || [
      { code: 'GRAMMAR', name: 'Grammar & Structure', questionCount: 30, selection: 'BALANCED' },
      { code: 'READING', name: 'Reading Comprehension', passages: 1 },
      { code: 'WRITING', name: 'Writing Expression', tasks: ['ESSAY', 'LETTER'] },
    ];

    await pool.query(
      `INSERT INTO public.assessment_definitions (
        id, code, exam_type, title, assessment_type, duration_minutes, status, instructions, sections_config, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'DIAGNOSTIC', $5, 'DRAFT', $6, $7, NOW(), NOW())`,
      [
        id,
        code,
        examType,
        title,
        Number(durationMinutes),
        instructions,
        JSON.stringify(defaultSections),
      ]
    );

    if (assignedProgramme) {
      await pool.query(
        `INSERT INTO public.programme_assessment_assignments (
          programme_id, assessment_definition_id, assessment_type, is_active
        ) VALUES ($1, $2, 'DIAGNOSTIC', true)
        ON CONFLICT (programme_id, assessment_type, is_active) 
        DO UPDATE SET assessment_definition_id = EXCLUDED.assessment_definition_id, assigned_at = NOW()`,
        [assignedProgramme, id]
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id,
          code,
          title,
          examType,
          assessmentType: 'DIAGNOSTIC',
          durationMinutes: Number(durationMinutes),
          status: 'DRAFT',
          assignedProgramme: assignedProgramme || examType,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/v1/admin/diagnostics error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
