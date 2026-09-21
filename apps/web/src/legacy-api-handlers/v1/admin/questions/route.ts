export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { ContentNormalizer } from '@/services/admin/content-normalizer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const status = searchParams.get('status') || 'ALL';
    const exam = searchParams.get('exam') || 'ALL';
    const section = searchParams.get('section') || 'ALL';
    const difficulty = searchParams.get('difficulty') || 'ALL';
    const assessment = searchParams.get('assessment') || searchParams.get('usage') || 'ALL';
    const contentKind = searchParams.get('contentKind') || 'ALL';
    const questionType = searchParams.get('questionType') || 'ALL';
    const dependency = searchParams.get('dependency') || 'ALL';
    const search = searchParams.get('search') || '';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const result = await ContentNormalizer.getNormalizedContent(pool, {
      page,
      pageSize,
      status,
      exam,
      section,
      difficulty,
      assessment,
      contentKind,
      questionType,
      dependency,
      search,
    });

    // Provide both structured answer object and backward-compatible fields
    const enrichedItems = result.items.map((item) => ({
      ...item,
      // Backward compatibility fields
      correctAnswer: item.answer.display || item.answer.primary || '',
      acceptedAnswers: item.answer.acceptedAnswers || [],
      passageTitle: item.passageTitle || undefined,
      passageText: item.passageContent || undefined,
      hash: item.code,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedItems,
      items: enrichedItems,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      counts: {
        all:
          result.metrics.tree.preAssessment.total +
          result.metrics.tree.ieltsMock.total +
          result.metrics.tree.ieltsPractice.total +
          result.metrics.tree.otherUnclassified.total,
        draft: result.metrics.draftCount,
        underReview: result.metrics.underReviewCount,
        approved: result.metrics.approvedCount,
        published: result.metrics.publishedCount,
        archived: result.metrics.archivedCount,
      },
      metrics: result.metrics,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/questions error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { getAuthenticatedSession, isValidTenantUuid } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tenantId = session?.tenantId;
    if (!tenantId || !isValidTenantUuid(tenantId)) {
      return NextResponse.json(
        {
          error: 'INVALID_TENANT_CONTEXT',
          message: 'A valid authorized tenant context is required to create questions.',
          referenceCode: 'INVALID_TENANT_CONTEXT',
          failingOperation: 'RESOLVE_TENANT_CONTEXT',
        },
        { status: 400 }
      );
    }

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
         VALUES (gen_random_uuid(), $1, $2, $3, now(), now())
         RETURNING id`,
        [code, (body.status || 'DRAFT').toLowerCase(), tenantId]
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
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        referenceCode:
          err.failingOperation === 'RESOLVE_TENANT_CONTEXT'
            ? 'INVALID_TENANT_CONTEXT'
            : 'QUESTION_CREATION_FAILED',
      },
      { status: err.failingOperation === 'RESOLVE_TENANT_CONTEXT' ? 400 : 500 }
    );
  }
}
