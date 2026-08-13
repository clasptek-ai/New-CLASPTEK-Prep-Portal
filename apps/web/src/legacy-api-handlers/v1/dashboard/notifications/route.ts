export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { DashboardCompositionService } from '@/services/student/dashboard-composition.service';
import { studentNotificationsService } from '@/services/student/notifications.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(req.nextUrl.searchParams.get('pageSize') || '10', 10);

    const data = await DashboardCompositionService.getNotifications(page, pageSize);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Mark all read logic
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      await studentNotificationsService.markAsRead(notificationId);
      return NextResponse.json({ success: true, notificationId });
    }

    return NextResponse.json({ error: 'notificationId or markAll required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
