export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const motivation = await ctx.getMotivation.execute({ studentId: session.userId });
    if (!motivation) {
      return NextResponse.json({
        dailyStreak: 0,
        weeklyStreak: 0,
        longestStreak: 0,
        practicePoints: 0,
        xp: 0,
        badges: [],
      });
    }

    return NextResponse.json({
      dailyStreak: motivation.dailyStreak,
      weeklyStreak: motivation.weeklyStreak,
      longestStreak: motivation.longestStreak,
      practicePoints: motivation.practicePoints,
      xp: motivation.xp,
      badges: motivation.badges,
      achievements: motivation.achievements,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
