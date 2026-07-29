export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const blueprintId = body.blueprintId || 'bp-ielts-acad';
  const templateId = `tmpl-${Date.now()}`;

  return NextResponse.json(
    {
      success: true,
      templateId,
      blueprintId,
      exam: body.exam || 'IELTS Academic',
      questionsAssembled: 40,
      status: 'GENERATED',
      message: 'Mock Template assembled dynamically from Published Question Bank.',
    },
    { status: 200 }
  );
}
