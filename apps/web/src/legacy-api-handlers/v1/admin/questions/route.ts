export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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

      const rawSection = tags[1] || payload.section || 'Grammar';
      // TitleCase section string presentation (e.g. 'READING' -> 'Reading', 'GRAMMAR' -> 'Grammar')
      const section = rawSection.charAt(0).toUpperCase() + rawSection.slice(1).toLowerCase();

      // Preserve raw difficulty from payload, falling back to r.proficiency_level if missing
      const difficulty = payload.difficulty || r.proficiency_level || 'MEDIUM';
      const proficiencyLevel = r.proficiency_level || payload.proficiencyLevel || null;

      return {
        id: r.question_id,
        code: r.code,
        exam,
        section,
        skill: r.grammar_topic || payload.skill || payload.topic || section,
        subSkill: r.grammar_subtopic || payload.subSkill || '',
        type: payload.type || 'MCQ',
        difficulty,
        proficiencyLevel,
        status:
          statusUpper === 'PUBLISHED'
            ? 'PUBLISHED'
            : statusUpper === 'APPROVED'
              ? 'APPROVED'
              : statusUpper === 'UNDER_REVIEW'
                ? 'UNDER_REVIEW'
                : 'DRAFT',
        usages: Array.isArray(payload.usages) ? payload.usages : ['DIAGNOSTIC', 'PRACTICE'],
        estimatedTime: payload.estimatedTime || '1.5 mins',
        officialSource: payload.officialSource || 'Clasptek Question Bank',
        version: `v${r.version_no}.0`,
        language: 'en-US',
        tags,
        passageCode: payload.passageCode || null,
        passageId: payload.passageId || payload.passage_id || null,
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
      mappedQuestions = mappedQuestions.filter(
        (q) => q.exam.toLowerCase() === examParam.toLowerCase()
      );
    }
    if (sectionParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter(
        (q) => q.section.toLowerCase() === sectionParam.toLowerCase()
      );
    }
    if (difficultyParam !== 'ALL') {
      mappedQuestions = mappedQuestions.filter((q) => {
        const d = (q.difficulty || '').toUpperCase();
        const p = (q.proficiencyLevel || '').toUpperCase();
        const target = difficultyParam.toUpperCase();

        if (target === 'MEDIUM') {
          return d === 'MEDIUM' || d === 'INTERMEDIATE' || p === 'INTERMEDIATE';
        }
        if (target === 'EASY') {
          return d === 'EASY' || d === 'FOUNDATION' || p === 'FOUNDATION';
        }
        if (target === 'HARD') {
          return d === 'HARD' || d === 'ADVANCED' || p === 'ADVANCED';
        }
        return d === target || p === target;
      });
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
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const code = body.code || `Q-${Date.now()}`;
    const prompt = body.text || body.prompt || 'Untitled question prompt';
    const exam = body.exam || 'English Proficiency';
    const section = body.section || 'Reading';
    const difficulty = (body.difficulty || 'MEDIUM').toUpperCase();
    const skill = body.skill || 'General Skill';
    const subSkill = body.subSkill || '';
    const type = body.type || 'MCQ';
    const options = Array.isArray(body.options) ? body.options : [];
    const correctAnswer = body.correctAnswer || options[0] || '';
    const explanation = body.explanation || '';
    const usages = Array.isArray(body.usages) ? body.usages : ['DIAGNOSTIC', 'PRACTICE'];

    const payload = {
      type,
      difficulty,
      usages,
      tags: [exam, section],
      explanation,
      skill,
      subSkill,
    };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const qRes = await client.query(
        `INSERT INTO public.questions (id, code, status, tenant_id, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, '00000000-0000-0000-0000-000000000000'::uuid, now(), now())
         RETURNING id`,
        [code, (body.status || 'DRAFT').toLowerCase()]
      );
      const questionId = qRes.rows[0].id;

      const qvRes = await client.query(
        `INSERT INTO public.question_versions
         (id, question_id, version_no, status, prompt, payload, explanation, created_at, proficiency_level, grammar_topic, grammar_subtopic)
         VALUES (gen_random_uuid(), $1, 1, $2, $3, $4, $5, now(), $6, $7, $8)
         RETURNING id`,
        [
          questionId,
          (body.status || 'DRAFT').toLowerCase(),
          prompt,
          JSON.stringify(payload),
          explanation,
          difficulty === 'EASY'
            ? 'FOUNDATION'
            : difficulty === 'HARD'
              ? 'ADVANCED'
              : 'INTERMEDIATE',
          skill,
          subSkill,
        ]
      );
      const versionId = qvRes.rows[0].id;

      if (options.length > 0) {
        for (let idx = 0; idx < options.length; idx++) {
          const optText = options[idx];
          const optCode = String.fromCharCode(65 + idx);
          const isCorrect = optText === correctAnswer || optCode === correctAnswer;

          await client.query(
            `INSERT INTO public.answer_options (id, question_version_id, option_code, option_text, is_correct, display_order)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
            [versionId, optCode, optText, isCorrect, idx + 1]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, id: questionId, code }, { status: 201 });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
