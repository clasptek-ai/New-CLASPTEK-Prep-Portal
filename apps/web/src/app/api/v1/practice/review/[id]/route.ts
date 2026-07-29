export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return NextResponse.json(
    {
      success: true,
      sessionId: id,
      exam: 'IELTS Academic',
      section: 'Reading',
      overallScore: '8 / 10',
      bandResult: 'Band 7.5',
      timeSpentSeconds: 650,
      weakSkills: ['Matching Headings'],
      strongSkills: ['Main Idea Inferences'],
    },
    { status: 200 }
  );
}
