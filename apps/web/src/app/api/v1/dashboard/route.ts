export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { DashboardCompositionService } from '@/services/student/dashboard-composition.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const studentIdParam = req.nextUrl.searchParams.get('studentId');
    const studentId = studentIdParam || session.userId;

    const isSpecialRole =
      session.roles.includes('ADMINISTRATOR') || session.roles.includes('INSTRUCTOR');
    if (session.userId !== studentId && !isSpecialRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const overview = await DashboardCompositionService.getOverview(studentId);
    return NextResponse.json(overview);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
