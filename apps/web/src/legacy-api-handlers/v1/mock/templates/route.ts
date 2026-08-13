export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';
import type { MockTemplate } from '@clasptek/domain-mock-examination';

export async function GET() {
  try {
    const ctx = getMockExaminationContext();
    const templates = await ctx.getTemplates.execute();

    return NextResponse.json({
      success: true,
      templates: templates.map((t: MockTemplate) => ({
        id: t.id,
        blueprintId: t.blueprintId,
        version: t.version,
        totalDurationMinutes: t.totalDurationMinutes,
        passingScore: t.passingScore,
        scoringStrategy: t.scoringStrategy,
        status: t.status,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
