export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function GET() {
  try {
    const ctx = getNotificationContext();
    const analytics = await ctx.getAnalytics.execute();
    return NextResponse.json({ success: true, data: analytics });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
