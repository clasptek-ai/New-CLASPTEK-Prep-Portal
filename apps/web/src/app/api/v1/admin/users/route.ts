export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

export async function GET(_req: NextRequest) {
  try {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminUsersRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();

    // Reconcile/backfill missing public.users or public.profiles from auth.users idempotently
    await pool.query(`
      INSERT INTO public.users (id, status, version, created_at, updated_at)
      SELECT id, 'ACTIVE', 1, created_at, now()
      FROM auth.users au
      WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id)
      ON CONFLICT (id) DO NOTHING
    `);

    await pool.query(`
      INSERT INTO public.profiles (id, user_id, first_name, last_name, locale, time_zone, version, created_at, updated_at)
      SELECT 
        gen_random_uuid(),
        au.id,
        COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
        COALESCE(au.raw_user_meta_data->>'last_name', 'Student'),
        'en',
        'UTC',
        1,
        au.created_at,
        now()
      FROM auth.users au
      WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = au.id)
    `);

    // Query canonical database records joining public.users, auth.users, and public.profiles
    const res = await pool.query(`
      SELECT 
        u.id,
        p.first_name,
        p.last_name,
        au.email,
        u.status,
        u.created_at as "registeredDate"
      FROM public.users u
      JOIN auth.users au ON au.id = u.id
      LEFT JOIN public.profiles p ON p.user_id = u.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);

    const mapped = res.rows.map((r: any) => {
      const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ').trim();
      const displayName = fullName || r.email;
      const regId = `CGA-2026-${r.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase()}`;

      return {
        id: r.id,
        registrationNumber: regId,
        name: displayName,
        email: r.email,
        phone: 'NOT RECORDED',
        role: 'STUDENT',
        status: r.status === 'ARCHIVED' || r.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        paymentStatus: 'NOT RECORDED',
        programme: 'English Proficiency',
        cohort: 'UNASSIGNED',
        progressPercent: 0,
        practiceUnlocked: true,
        mockUnlocked: true,
        registeredDate: r.registeredDate || new Date().toISOString(),
        statusHistory: [],
      };
    });

    return NextResponse.json({ success: true, data: mapped }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_USERS_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve registered students.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
