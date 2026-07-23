export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function GET() {
  try {
    const ctx = getNotificationContext();
    const announcements = await ctx.getAnnouncements.execute();

    return NextResponse.json({
      success: true,
      data: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        authorId: a.authorId,
        status: a.status,
        audienceTarget: a.audienceTarget,
        createdAt: a.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
