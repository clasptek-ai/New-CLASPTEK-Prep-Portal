export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const questionId = body.questionId || 'q-unknown';

  return NextResponse.json(
    {
      success: true,
      questionId,
      bookmarked: true,
      message: `Question ${questionId} added to revision bookmarks.`,
    },
    { status: 200 }
  );
}
