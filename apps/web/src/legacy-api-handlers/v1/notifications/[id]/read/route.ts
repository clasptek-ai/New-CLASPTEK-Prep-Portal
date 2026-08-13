export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { recipientId } = await req.json().catch(() => ({ recipientId: 'user-1' }));
    const ctx = getNotificationContext();
    await ctx.markNotificationRead.execute(id, recipientId);

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 400 }
    );
  }
}
