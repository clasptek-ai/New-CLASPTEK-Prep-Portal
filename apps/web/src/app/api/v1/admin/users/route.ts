export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { randomUUID } from 'crypto';

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
      INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
      SELECT 
        gen_random_uuid(),
        au.id,
        COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
        COALESCE(au.raw_user_meta_data->>'last_name', 'Student'),
        au.raw_user_meta_data->>'phone',
        au.raw_user_meta_data->>'programme',
        'en',
        'UTC',
        1,
        au.created_at,
        now()
      FROM auth.users au
      WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = au.id)
    `);

    // Backfill phone and target_programme from raw_user_meta_data if present in auth.users
    await pool.query(`
      UPDATE public.profiles p
      SET phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone'),
          target_programme = COALESCE(p.target_programme, au.raw_user_meta_data->>'programme')
      FROM auth.users au
      WHERE au.id = p.user_id
        AND (p.phone IS NULL OR p.target_programme IS NULL)
    `);

    // Query canonical database records joining profiles and programme enrollments, excluding Admin/Staff roles
    const res = await pool.query(`
      SELECT 
        u.id,
        p.first_name,
        p.last_name,
        au.email,
        COALESCE(p.phone, au.phone, au.raw_user_meta_data->>'phone', 'NOT RECORDED') as phone,
        COALESCE(spe.programme_id::text, p.target_programme, au.raw_user_meta_data->>'programme', 'UNASSIGNED') as programme,
        COALESCE(spe.cohort_id::text, 'UNASSIGNED') as cohort,
        u.status,
        u.created_at as "registeredDate"
      FROM public.users u
      JOIN auth.users au ON au.id = u.id
      LEFT JOIN public.profiles p ON p.user_id = u.id
      LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = u.id
      WHERE u.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 
          FROM public.user_roles ur 
          JOIN public.roles r ON r.id = ur.role_id 
          WHERE ur.user_id = u.id 
            AND r.name IN ('Super Administrator', 'Administrator', 'Support')
        )
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
        phone: r.phone || 'NOT RECORDED',
        role: 'STUDENT',
        status: r.status === 'ARCHIVED' || r.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        paymentStatus: 'NOT RECORDED',
        programme: r.programme || 'UNASSIGNED',
        cohort: r.cohort || 'UNASSIGNED',
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, programme, cohort, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminUsersPatchRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Update public.profiles
    if (phone !== undefined || programme !== undefined) {
      await pool.query(
        `UPDATE public.profiles
         SET phone = COALESCE($1, phone),
             target_programme = COALESCE($2, target_programme),
             updated_at = now()
         WHERE user_id = $3`,
        [phone || null, programme || null, userId]
      );
    }

    // 2. Upsert into public.student_programme_enrollments if programme or cohort updated
    if (programme !== undefined || cohort !== undefined) {
      const existingEnroll = await pool.query(
        `SELECT id FROM public.student_programme_enrollments WHERE student_id = $1`,
        [userId]
      );

      if (existingEnroll.rows.length > 0) {
        await pool.query(
          `UPDATE public.student_programme_enrollments
           SET programme_id = COALESCE($1, programme_id),
               cohort_id = COALESCE($2, cohort_id),
               updated_at = now()
           WHERE student_id = $3`,
          [programme || null, cohort || null, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO public.student_programme_enrollments
           (id, student_id, programme_id, cohort_id, enrollment_status, enrolled_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'ACTIVE', now(), now(), now())`,
          [randomUUID(), userId, programme || null, cohort || null]
        );
      }
    }

    // 3. Update public.users status
    if (status !== undefined) {
      await pool.query(
        `UPDATE public.users
         SET status = $1,
             updated_at = now()
         WHERE id = $2`,
        [status, userId]
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
