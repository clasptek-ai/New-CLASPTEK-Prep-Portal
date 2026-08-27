export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/submissions/audit
 * Global Admin-Only Submissions Audit Endpoint.
 *
 * Allows authorized administrators to inspect candidate submissions across:
 * 1. Grammar (Objective Questions)
 * 2. Reading (Passage Comprehension Items)
 * 3. Writing (Task 1 & Task 2 Essays + AI Evaluations)
 *
 * Scopes: Global repository with search and filter capabilities.
 * NOTE: This endpoint is strictly for global admin audit and does NOT contaminate individual student profiles.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const isAdmin =
      session?.roles?.some((r) =>
        ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN'].includes(r.toUpperCase())
      ) || process.env.NODE_ENV === 'development';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const skill = (searchParams.get('skill') || 'all').toLowerCase();
    const filterStudentId = searchParams.get('studentId')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const results: {
      grammarSubmissions: any[];
      readingSubmissions: any[];
      writingSubmissions: any[];
    } = {
      grammarSubmissions: [],
      readingSubmissions: [],
      writingSubmissions: [],
    };

    // ─── 1. Grammar Submissions ───────────────────────────────────────
    if (skill === 'all' || skill === 'grammar') {
      let gQuery = `
        SELECT 
          aaa.attempt_id,
          aaa.question_id,
          aaa.response_payload,
          aaa.is_correct,
          aaa.time_spent_ms,
          aaa.updated_at,
          aa.student_id,
          aa.catalog_id AS assessment_id,
          aa.tenant_id,
          au.email AS student_email,
          COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) AS student_name,
          q.code AS question_code,
          qv.prompt,
          qv.grammar_topic,
          qv.proficiency_level
        FROM public.assessment_attempt_answers aaa
        JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id
        LEFT JOIN auth.users au ON au.id::text = aa.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = aa.student_id OR p.id = aa.student_id)
        LEFT JOIN public.questions q ON q.id = aaa.question_id
        LEFT JOIN public.question_versions qv ON qv.id = q.current_version_id
        WHERE (aaa.response_payload->>'sectionCode' ILIKE '%grammar%' OR qv.grammar_topic IS NOT NULL OR q.code LIKE 'INT-GRM-%')
      `;
      const gParams: any[] = [];
      if (filterStudentId) {
        gParams.push(filterStudentId);
        gQuery += ` AND aa.student_id::text = $${gParams.length}`;
      }
      gQuery += ` ORDER BY aaa.updated_at DESC LIMIT $${gParams.length + 1}`;
      gParams.push(limit);

      const gRes = await pool.query(gQuery, gParams);
      results.grammarSubmissions = gRes.rows.map((r) => ({
        attemptId: r.attempt_id,
        assessmentId: r.assessment_id,
        studentId: r.student_id,
        studentName: r.student_name || 'Candidate',
        studentEmail: r.student_email,
        tenantId: r.tenant_id,
        questionId: r.question_id,
        questionCode: r.question_code,
        prompt: r.prompt,
        grammarTopic: r.grammar_topic,
        proficiencyLevel: r.proficiency_level,
        studentAnswer:
          r.response_payload?.selectedOptionCode ||
          r.response_payload?.selectedOption ||
          r.response_payload,
        isCorrect: r.is_correct,
        score: r.is_correct ? 1 : 0,
        submissionTimestamp: r.updated_at,
      }));
    }

    // ─── 2. Reading Submissions ───────────────────────────────────────
    if (skill === 'all' || skill === 'reading') {
      let rQuery = `
        SELECT 
          aaa.attempt_id,
          aaa.question_id,
          aaa.response_payload,
          aaa.is_correct,
          aaa.updated_at,
          aa.student_id,
          aa.catalog_id AS assessment_id,
          aa.tenant_id,
          au.email AS student_email,
          COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) AS student_name,
          q.code AS question_code,
          qv.prompt,
          qv.payload->>'passageCode' AS passage_code
        FROM public.assessment_attempt_answers aaa
        JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id
        LEFT JOIN auth.users au ON au.id::text = aa.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = aa.student_id OR p.id = aa.student_id)
        LEFT JOIN public.questions q ON q.id = aaa.question_id
        LEFT JOIN public.question_versions qv ON qv.id = q.current_version_id
        WHERE (aaa.response_payload->>'sectionCode' ILIKE '%reading%' OR q.code LIKE 'Q-READ-%' OR q.code LIKE 'IELTS-READ-%')
      `;
      const rParams: any[] = [];
      if (filterStudentId) {
        rParams.push(filterStudentId);
        rQuery += ` AND aa.student_id::text = $${rParams.length}`;
      }
      rQuery += ` ORDER BY aaa.updated_at DESC LIMIT $${rParams.length + 1}`;
      rParams.push(limit);

      const rRes = await pool.query(rQuery, rParams);
      results.readingSubmissions = rRes.rows.map((r) => ({
        attemptId: r.attempt_id,
        assessmentId: r.assessment_id,
        studentId: r.student_id,
        studentName: r.student_name || 'Candidate',
        studentEmail: r.student_email,
        tenantId: r.tenant_id,
        questionId: r.question_id,
        questionCode: r.question_code,
        passageCode: r.passage_code,
        prompt: r.prompt,
        studentAnswer:
          r.response_payload?.selectedOptionCode ||
          r.response_payload?.textResponse ||
          r.response_payload?.text ||
          r.response_payload?.answer ||
          (typeof r.response_payload === 'string'
            ? r.response_payload
            : JSON.stringify(r.response_payload)),
        isCorrect: r.is_correct,
        score: r.is_correct ? 1 : 0,
        submissionTimestamp: r.updated_at,
      }));
    }

    // ─── 3. Writing Submissions ───────────────────────────────────────
    if (skill === 'all' || skill === 'writing') {
      let wQuery = `
        SELECT 
          se.id AS evaluation_id,
          se.session_id AS attempt_id,
          se.response_id,
          se.student_id,
          se.assessment_type,
          se.status AS ai_status,
          se.overall_score,
          se.score_label,
          se.feedback,
          se.raw_response_reference AS essay_text,
          se.created_at,
          se.completed_at,
          se.metadata,
          au.email AS student_email,
          COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) AS student_name,
          json_agg(json_build_object('criterionName', sec.criterion_name, 'score', sec.score, 'maxScore', sec.max_score, 'feedback', sec.feedback)) AS criteria
        FROM public.subjective_evaluations se
        LEFT JOIN auth.users au ON au.id::text = se.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = se.student_id OR p.id = se.student_id)
        LEFT JOIN public.subjective_evaluation_criteria sec ON se.id = sec.evaluation_id
        WHERE se.skill = 'Writing'
      `;
      const wParams: any[] = [];
      if (filterStudentId) {
        wParams.push(filterStudentId);
        wQuery += ` AND se.student_id::text = $${wParams.length}`;
      }
      wQuery += ` GROUP BY se.id, au.email, p.first_name, p.last_name, au.raw_user_meta_data ORDER BY se.created_at DESC LIMIT $${wParams.length + 1}`;
      wParams.push(limit);

      const wRes = await pool.query(wQuery, wParams);
      results.writingSubmissions = wRes.rows.map((r) => {
        const text = r.essay_text || '';
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        return {
          evaluationId: r.evaluation_id,
          attemptId: r.attempt_id,
          responseId: r.response_id,
          studentId: r.student_id,
          studentName: r.student_name || 'Candidate',
          studentEmail: r.student_email,
          assessmentType: r.assessment_type,
          taskType: r.metadata?.taskType || 'TASK_2',
          taskPrompt: r.metadata?.taskPrompt || 'IELTS Writing Task',
          studentResponse: text,
          wordCount,
          aiStatus: r.ai_status,
          overallScore: r.overall_score ? parseFloat(r.overall_score) : null,
          scoreLabel: r.score_label,
          feedback: r.feedback,
          criteria: r.criteria,
          submissionTimestamp: r.created_at,
          completedAt: r.completed_at,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/submissions/audit error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
