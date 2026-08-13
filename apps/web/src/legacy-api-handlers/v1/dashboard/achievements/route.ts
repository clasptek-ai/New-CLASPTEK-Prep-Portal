export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { DashboardCompositionService } from '@/services/student/dashboard-composition.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const achievements = await DashboardCompositionService.getAchievements();
    return NextResponse.json(achievements);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
