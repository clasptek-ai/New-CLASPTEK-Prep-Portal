export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return NextResponse.json(
    {
      success: true,
      sessionId: id,
      exam: 'IELTS Academic',
      section: 'Reading',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    { status: 200 }
  );
}
