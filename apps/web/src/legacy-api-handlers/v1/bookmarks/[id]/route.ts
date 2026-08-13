export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return NextResponse.json(
    {
      success: true,
      questionId: id,
      bookmarked: false,
      message: `Question ${id} removed from bookmarks.`,
    },
    { status: 200 }
  );
}
