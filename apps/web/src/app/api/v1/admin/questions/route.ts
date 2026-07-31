export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const statusParam = (searchParams.get('status') || 'ALL').toUpperCase();
    const examParam = searchParams.get('exam') || 'ALL';
    const sectionParam = searchParams.get('section') || 'ALL';
    const difficultyParam = (searchParams.get('difficulty') || 'ALL').toUpperCase();
    const usageParam = (searchParams.get('usage') || '').toUpperCase();
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // Query status counts
    const statusCountsRes = await pool.query(`
      SELECT UPPER(qv.status) as status_name, COUNT(DISTINCT q.id) as cnt
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
      GROUP BY UPPER(qv.status)
    `);

    let totalAll = 0;
    let totalDraft = 0;
    let totalUnderReview = 0;
    let totalApproved = 0;
    let totalPublished = 0;
    let totalArchived = 0;

    statusCountsRes.rows.forEach((r) => {
      const cnt = parseInt(r.cnt, 10);
      totalAll += cnt;
      if (r.status_name === 'DRAFT') totalDraft = cnt;
      else if (r.status_name === 'UNDER_REVIEW') totalUnderReview = cnt;
      else if (r.status_name === 'APPROVED') totalApproved = cnt;
      else if (r.status_name === 'PUBLISHED') totalPublished = cnt;
      else if (r.status_name === 'ARCHIVED') totalArchived = cnt;
    });

    // Main Query
    const mainRes = await pool.query(`
      SELECT 
        q.id as question_id,
        q.code,
        qv.id as version_id,
        qv.version_no,
        qv.status,
        qv.prompt,
        qv.proficiency_level,
        qv.grammar_topic,
        qv.grammar_subtopic,
        qv.payload,
        q.created_at,
        q.updated_at
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
      ORDER BY q.created_at DESC
    `);

    // Fetch answer options
    const optRes = await pool.query(`
      SELECT question_version_id, option_code, option_text, is_correct, display_order
      FROM public.answer_options
      ORDER BY display_order ASC
    `);

    const optionsByVersion = new Map<string, any[]>();
    optRes.rows.forEach((o) => {
      if (!optionsByVersion.has(o.question_version_id)) {
        optionsByVersion.set(o.question_version_id, []);
      }
      optionsByVersion.get(o.question_version_id)!.push(o);
    });

    // Map and filter rows
    let mappedQuestions = mainRes.rows.map((r) => {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      const statusUpper = (r.status || 'DRAFT').toUpperCase();
      const optionsForVer = optionsByVersion.get(r.version_id) || [];

      const options = optionsForVer.map((o) => o.option_text);
      const correctOpt = optionsForVer.find((o) => o.is_correct);

      const tags: string[] = Array.isArray(payload.tags) ? payload.tags : [];
      const exam = tags[0] || payload.examType || 'English Proficiency';
      const section = tags[1] || payload.section || 'Grammar';

      const proficiencyLevel = (r.proficiency_level || payload.difficulty || 'MEDIUM').toUpperCase();

      return {
        id: r.question_id,
        code: r.code,
        exam,
        section,
        skill: r.grammar_topic || section,
        subSkill: r.grammar_subtopic || '',
        type: payload.type || 'MCQ',
        difficulty: proficiencyLevel,
        status: statusUpper === 'PUBLISHED' ? 'PUBLISHED' : statusUpper === 'APPROVED' ? 'APPROVED' : statusUpper === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'DRAFT',
        usages: Array.isArray(payload.usages) ? payload.usages : ['DIAGNOSTIC', 'PRACTICE'],
        estimatedTime: '1.5 mins',
        officialSource: 'Clasptek Question Bank',
        version: `v${r.version_no}.0`,
        language: 'en-US',
        tags,
        text: r.prompt,
        options,
        correctAnswer: correctOpt ? correctOpt.option_text : options[0] || '',
        explanation: payload.explanation || '',
        hash: r.code,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    // Filtering
    if (statusParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter((q) => q.status === statusParam);
    }
    if (examParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter((q) => q.exam.toLowerCase() === examParam.toLowerCase());
    }
    if (sectionParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter((q) => q.section.toLowerCase() === sectionParam.toLowerCase());
    }
    if (difficultyParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter((q) => q.difficulty === difficultyParam);
    }
    if (usageParam) {
      mappedQuestions = mappedQuestions.filter((q) => q.usages.includes(usageParam));
    }
    if (search) {
      mappedQuestions = mappedQuestions.filter(
        (q) =>
          q.text.toLowerCase().includes(search) ||
          q.code.toLowerCase().includes(search) ||
          q.skill.toLowerCase().includes(search)
      );
    }

    const total = mappedQuestions.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginated = mappedQuestions.slice(startIdx, startIdx + pageSize);

    return NextResponse.json({
      success: true,
      data: paginated,
      items: paginated,
      total,
      page,
      pageSize,
      totalPages,
      counts: {
        all: totalAll,
        draft: totalDraft,
        underReview: totalUnderReview,
        approved: totalApproved,
        published: totalPublished,
        archived: totalArchived,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/questions error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, id: body.code || 'q-new-001' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
