export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { aiCoachService } from '@/features/learning-intelligence/application/ai-coach.service';

export async function GET(_req: NextRequest) {
  const history = await aiCoachService.getChatHistory();
  return NextResponse.json({ success: true, data: history }, { status: 200 });
}
