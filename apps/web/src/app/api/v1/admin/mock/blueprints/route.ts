export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MOCK_BLUEPRINTS } from '@/features/mock-engine/domain/mock-blueprint';

export async function GET(_req: NextRequest) {
  return NextResponse.json({ success: true, data: DEFAULT_MOCK_BLUEPRINTS }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = `bp-${Date.now()}`;

  const createdBlueprint = {
    id,
    code: body.code || `BP-${Date.now().toString().slice(-4)}`,
    exam: body.exam || 'IELTS Academic',
    title: body.title || 'New Exam Blueprint',
    version: body.version || 'v1.0',
    status: 'ACTIVE',
    sections: body.sections || [],
    totalQuestions: body.totalQuestions || 40,
    totalTimeMinutes: body.totalTimeMinutes || 120,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      success: true,
      data: createdBlueprint,
      message: 'Mock Blueprint created successfully.',
    },
    { status: 201 }
  );
}
