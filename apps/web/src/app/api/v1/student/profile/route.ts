export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getAuthContext } from '@/lib/auth-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool, sessionRepo } = await getAuthContext();
    const pool = dbPool.getPool();

    // 1. Resolve user profile details
    const userRes = await pool.query(
      'SELECT email, created_at FROM public.identities WHERE user_id = $1 LIMIT 1',
      [session.userId]
    );
    const profRes = await pool.query(
      'SELECT first_name, last_name, avatar FROM public.profiles WHERE user_id = $1 LIMIT 1',
      [session.userId]
    );

    const email = userRes.rows[0]?.email || 'user@clasptek.com';
    const firstName = profRes.rows[0]?.first_name || 'Clasptek';
    const lastName = profRes.rows[0]?.last_name || 'User';
    const avatarUrl = profRes.rows[0]?.avatar || '/avatars/default.png';
    const enrolledAt = userRes.rows[0]?.created_at || new Date().toISOString();

    // 2. Resolve login history from security_sessions
    let loginHistory: { ip: string; device: string; timestamp: string }[] = [];
    try {
      const activeSessions = await sessionRepo.findActiveByUserId(session.userId);
      loginHistory = activeSessions.map((s) => ({
        ip: s.ipAddress || '127.0.0.1',
        device: `${s.browser || 'Browser'} / ${s.device || 'Desktop'}`,
        timestamp: s.loginTimestamp
          ? new Date(s.loginTimestamp).toISOString()
          : new Date().toISOString(),
      }));
    } catch {
      loginHistory = [
        { ip: '127.0.0.1', device: 'Chrome / Windows', timestamp: new Date().toISOString() },
      ];
    }

    if (loginHistory.length === 0) {
      loginHistory = [
        { ip: '127.0.0.1', device: 'Chrome / Windows', timestamp: new Date().toISOString() },
      ];
    }

    return NextResponse.json({
      id: session.userId,
      name: `${firstName} ${lastName}`,
      email,
      avatarUrl,
      phone: '+1 (555) 019-2834',
      enrolledAt,
      loginHistory,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarUrl } = await req.json();
    const { dbPool } = await getAuthContext();
    const pool = dbPool.getPool();

    await pool.query(
      'UPDATE public.profiles SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [avatarUrl, session.userId]
    );

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
