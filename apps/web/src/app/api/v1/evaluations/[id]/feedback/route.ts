export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/evaluations/[id]/feedback
 * Fetch feedback sections, recommendations, and evidence references for a published evaluation.
 * Only the student who owns the result (or admin) may access this.
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    // Admins/reviewers may bypass student-scoped check
    const isSpecialRole =
      session.roles.includes('ADMINISTRATOR') || session.roles.includes('INSTRUCTOR');
    const scopedStudentId = isSpecialRole ? undefined : studentId;

    const feedback = await ctx.getFeedback.execute({
      resultId: id,
      studentId: scopedStudentId,
    });

    if (!feedback)
      return NextResponse.json({ error: 'Evaluation result not found' }, { status: 404 });

    return NextResponse.json({
      feedbackSections: feedback.sections.map((s) => ({
        id: s.id,
        sectionType: s.sectionType,
        criterionCode: s.criterionCode,
        content: s.content,
        severity: s.severity?.level,
        orderIndex: s.orderIndex,
      })),
      recommendations: feedback.recommendations.map((r) => ({
        id: r.id,
        recommendationType: r.recommendationType,
        priority: r.priority,
        title: r.title,
        description: r.description,
        targetCompetencyCode: r.targetCompetencyCode,
      })),
      evidenceReferences: feedback.evidenceRefs.map((ev) => ({
        id: ev.id,
        criterionCode: ev.criterionCode,
        textExcerpt: ev.textExcerpt,
        relevanceNote: ev.relevanceNote,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not been published'))
      return NextResponse.json({ error: msg }, { status: 403 });
    if (msg.includes('Access denied')) return NextResponse.json({ error: msg }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
