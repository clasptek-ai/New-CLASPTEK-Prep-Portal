export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get('recipientId') || 'user-1';

    const ctx = getNotificationContext();
    const notifications = await ctx.getNotifications.execute(recipientId);

    return NextResponse.json({
      success: true,
      data: notifications.map((n) => ({
        id: n.id,
        recipientId: n.recipientId,
        category: n.category,
        priority: n.priority,
        title: n.title,
        body: n.body,
        status: n.status,
        channel: n.channel,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
