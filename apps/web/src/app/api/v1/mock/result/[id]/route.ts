export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return NextResponse.json(
    {
      success: true,
      resultId: id,
      exam: 'IELTS Academic',
      rawScore: 32,
      totalQuestions: 40,
      percentage: 80,
      bandScore: 'Band 7.5',
      label: 'Good User',
      sectionScores: {
        Reading: { rawScore: 32, total: 40, percentage: 80 },
        Listening: { rawScore: 34, total: 40, percentage: 85 },
      },
    },
    { status: 200 }
  );
}
