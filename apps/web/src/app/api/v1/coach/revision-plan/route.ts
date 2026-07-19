import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { CampaignType } from '@clasptek/domain-learning-coach';

/**
 * POST /api/v1/coach/revision-plan
 * Generate/register a revision plan campaign.
 * Body: { coachId, campaignType, startDate, endDate, focusAreas, examDate }
 */

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { coachId, campaignType, startDate, endDate, focusAreas, examDate } = body;

    if (!coachId || !campaignType || !startDate || !endDate || !focusAreas) {
      return NextResponse.json({ error: 'Missing required campaign plan parameters' }, { status: 400 });
    }

    const plan = await ctx.generateRevisionPlan.execute({
      coachId,
      campaignType: campaignType as CampaignType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      focusAreas,
      examDate: examDate ? new Date(examDate) : undefined
    });

    return NextResponse.json({
      planId: plan.id,
      coachId: plan.coachId,
      campaignType: plan.campaign.campaignType,
      status: plan.status,
      startDate: plan.campaign.startDate,
      endDate: plan.campaign.endDate
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
