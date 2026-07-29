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
      resultId: id,
      exam: 'IELTS Academic',
      overallResult: 'Band 7.5 Good User',
      weaknessAreas: ['Matching Headings'],
      strongAreas: ['Reading Inferences', 'Vocabulary in Context'],
      itemReviewCount: 40,
    },
    { status: 200 }
  );
}
