export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { announcementId, sentBy, totalRecipients } = body;

    if (!announcementId || !sentBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const ctx = getNotificationContext();
    const broadcastId = await ctx.broadcastAnnouncement.execute({
      announcementId,
      sentBy,
      totalRecipients,
    });

    return NextResponse.json({ success: true, broadcastId });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
