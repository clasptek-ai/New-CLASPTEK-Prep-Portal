export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { requireAdminSession } from '@/lib/admin-auth';

/**
 * GET /api/v1/admin/questions/audit
 * Audits all Pre-Assessment and general Reading questions in the inventory.
 * Categorizes questions by type, option counts, validity, and flag issues.
 */
export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch all reading passages
    const passagesRes = await pool.query(`
      SELECT id, code, title, exam_type, status, created_at
      FROM public.reading_passages
      ORDER BY created_at DESC
    `);

    // 2. Fetch all reading questions & versions
    const questionsRes = await pool.query(`
      SELECT 
        q.id as question_id,
        q.code as question_code,
        q.question_type as base_question_type,
        qv.id as version_id,
        qv.prompt,
        qv.proficiency_level,
        qv.payload,
        qv.status as version_status
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
        AND (
          qv.payload->>'passageCode' IS NOT NULL 
          OR q.code LIKE 'ENG-READ%' 
          OR q.code LIKE 'PAS-%'
          OR q.question_type = 'READING'
        )
      ORDER BY q.code ASC
    `);

    const versionIds = questionsRes.rows.map((r: any) => r.version_id);
    const optionsRes =
      versionIds.length > 0
        ? await pool.query(
            `
      SELECT question_version_id, option_code, option_text, is_correct, display_order
      FROM public.answer_options
      WHERE question_version_id = ANY($1::uuid[])
      ORDER BY question_version_id, display_order ASC
    `,
            [versionIds]
          )
        : { rows: [] };

    const optionsByVersion = new Map<string, any[]>();
    optionsRes.rows.forEach((o: any) => {
      if (!optionsByVersion.has(o.question_version_id)) {
        optionsByVersion.set(o.question_version_id, []);
      }
      optionsByVersion.get(o.question_version_id)!.push({
        code: o.option_code,
        text: o.option_text,
        isCorrect: Boolean(o.is_correct),
      });
    });

    // 3. Audit each question
    let totalQuestions = 0;
    let validCount = 0;
    let invalidCount = 0;
    let optionBasedCount = 0;
    let inputBasedCount = 0;
    let fixedChoiceCount = 0;

    const auditedQuestions = questionsRes.rows.map((r: any) => {
      totalQuestions++;
      const payload = r.payload || {};
      const rawType = (payload.questionType || r.base_question_type || 'MCQ')
        .toUpperCase()
        .replace(/[\s-]/g, '_');
      const opts = optionsByVersion.get(r.version_id) || [];
      const passageCode = payload.passageCode || null;

      let category = 'OPTION_BASED';
      let resolvedType = 'MCQ';
      let isValid = true;
      const issues: string[] = [];

      if (rawType === 'TRUE_FALSE_NOT_GIVEN' || rawType === 'TFNG') {
        resolvedType = 'TRUE_FALSE_NOT_GIVEN';
        category = 'FIXED_CHOICE';
        fixedChoiceCount++;
      } else if (rawType === 'YES_NO_NOT_GIVEN' || rawType === 'YNNG') {
        resolvedType = 'YES_NO_NOT_GIVEN';
        category = 'FIXED_CHOICE';
        fixedChoiceCount++;
      } else if (
        ['COMPLETION', 'GAP_FILL', 'FILL_IN_THE_BLANK', 'SHORT_ANSWER', 'SHORT_RESPONSE'].includes(
          rawType
        )
      ) {
        resolvedType = rawType;
        category = 'INPUT_BASED';
        inputBasedCount++;
        const hasAnswers = Boolean(
          payload.acceptedAnswers?.length || payload.correctAnswers?.length || payload.correctAnswer
        );
        if (!hasAnswers) {
          isValid = false;
          issues.push('Input-based question has no acceptedAnswers configured in payload');
        }
      } else {
        // Standard MCQ or Matching
        resolvedType = rawType;
        category = 'OPTION_BASED';
        optionBasedCount++;
        if (opts.length < 2) {
          isValid = false;
          issues.push(`Option-based question requires >=2 options, but has ${opts.length}`);
        }
        const hasCorrect = opts.some((o) => o.isCorrect);
        if (opts.length >= 2 && !hasCorrect) {
          isValid = false;
          issues.push('Option-based question has options but none are marked as correct');
        }
      }

      if (isValid) validCount++;
      else invalidCount++;

      return {
        questionId: r.question_id,
        versionId: r.version_id,
        code: r.question_code,
        passageCode,
        rawType,
        resolvedType,
        category,
        optionCount: opts.length,
        isValid,
        issues,
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalPassages: passagesRes.rows.length,
        totalQuestions,
        validCount,
        invalidCount,
        optionBasedCount,
        inputBasedCount,
        fixedChoiceCount,
      },
      passages: passagesRes.rows,
      questions: auditedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Audit failed' },
      { status: 500 }
    );
  }
}
