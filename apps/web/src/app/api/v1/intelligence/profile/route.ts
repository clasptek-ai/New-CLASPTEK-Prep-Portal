export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LEARNER_PROFILE } from '@/features/learning-intelligence/domain/learner-intelligence-profile';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { success: true, data: DEFAULT_LEARNER_PROFILE },
    { status: 200 }
  );
}
