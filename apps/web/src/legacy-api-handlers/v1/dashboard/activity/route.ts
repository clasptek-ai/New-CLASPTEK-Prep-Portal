export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { DashboardCompositionService } from '@/services/student/dashboard-composition.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(req.nextUrl.searchParams.get('pageSize') || '5', 10);

    const activity = await DashboardCompositionService.getActivity(page, pageSize);
    return NextResponse.json(activity);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
