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

    // 1. Resolve user profile details from public tables and auth.users
    const userRes = await pool.query(
      'SELECT email, raw_user_meta_data, created_at FROM auth.users WHERE id = $1 LIMIT 1',
      [session.userId]
    );
    const profRes = await pool.query(
      'SELECT first_name, last_name, avatar, phone FROM public.profiles WHERE user_id = $1 LIMIT 1',
      [session.userId]
    );

    const au = userRes.rows[0] || {};
    const meta = au.raw_user_meta_data || {};
    const email = au.email || '';

    let firstName =
      profRes.rows[0]?.first_name || meta.first_name || meta.name?.split(' ')[0] || '';
    let lastName =
      profRes.rows[0]?.last_name ||
      meta.last_name ||
      meta.name?.split(' ').slice(1).join(' ') ||
      '';
    const avatarUrl = profRes.rows[0]?.avatar || '/avatars/default.png';
    const phone = profRes.rows[0]?.phone || meta.phone || '';
    const enrolledAt = profRes.rows[0]?.created_at || au.created_at || new Date().toISOString();

    firstName = firstName.trim();
    lastName = lastName.trim();
    const fullName =
      `${firstName} ${lastName}`.trim() || email.split('@')[0] || 'Authenticated User';

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
      loginHistory = [];
    }

    return NextResponse.json({
      id: session.userId,
      name: fullName,
      email,
      avatarUrl,
      phone: phone || '',
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
