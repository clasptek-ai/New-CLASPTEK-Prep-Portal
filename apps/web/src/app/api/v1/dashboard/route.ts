export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getAuthContext } from '@/lib/auth-context';
import { DashboardCompositionService } from '@/services/student/dashboard-composition.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const studentIdParam = req.nextUrl.searchParams.get('studentId');
    const studentId = studentIdParam || session.userId;

    const isSpecialRole =
      session.roles.includes('ADMINISTRATOR') || session.roles.includes('INSTRUCTOR');
    if (session.userId !== studentId && !isSpecialRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Resolve student profile directly from PostgreSQL database singleton in server handler
    let studentName = '';
    let avatarUrl = '/avatars/default.png';

    try {
      const { dbPool } = await getAuthContext();
      const pool = dbPool.getPool();
      const userRes = await pool.query(
        'SELECT email, raw_user_meta_data FROM auth.users WHERE id = $1 LIMIT 1',
        [studentId]
      );
      const profRes = await pool.query(
        'SELECT first_name, last_name, avatar FROM public.profiles WHERE user_id = $1 LIMIT 1',
        [studentId]
      );

      if (profRes.rows.length > 0) {
        const fn = profRes.rows[0].first_name || '';
        const ln = profRes.rows[0].last_name || '';
        studentName = `${fn} ${ln}`.trim();
        if (profRes.rows[0].avatar) avatarUrl = profRes.rows[0].avatar;
      }

      if (!studentName && userRes.rows.length > 0) {
        const meta = userRes.rows[0].raw_user_meta_data || {};
        const email = userRes.rows[0].email || '';
        studentName =
          meta.name ||
          meta.full_name ||
          (meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : '') ||
          email.split('@')[0];
      }
    } catch (err) {
      console.error('Error resolving student profile in GET /api/v1/dashboard:', err);
    }

    const overview = await DashboardCompositionService.getOverview(studentId, {
      studentName,
      avatarUrl,
    });

    return NextResponse.json(overview);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
