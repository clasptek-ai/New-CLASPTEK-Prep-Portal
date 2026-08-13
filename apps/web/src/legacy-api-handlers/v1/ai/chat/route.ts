export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { aiCoachService } from '@/features/learning-intelligence/application/ai-coach.service';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = body.prompt || body.query || body.message || 'Help me prepare for my exam';

  const reply = await aiCoachService.askCoach(query);
  return NextResponse.json({ success: true, data: reply }, { status: 200 });
}
