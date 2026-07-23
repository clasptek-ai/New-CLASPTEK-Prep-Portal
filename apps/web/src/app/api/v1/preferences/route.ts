export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationContext } from '@/lib/notification-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'user-1';

    const ctx = getNotificationContext();
    const pref = await ctx.getPreferences.execute(userId);

    return NextResponse.json({ success: true, data: pref });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, presetProfile, enabledCategories } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const ctx = getNotificationContext();
    const updated = await ctx.updatePreferences.execute({
      userId,
      presetProfile,
      enabledCategories,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
