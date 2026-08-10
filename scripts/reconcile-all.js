const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function reconcileAll() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Reconciling any unmapped auth.users into public.users and public.profiles...');

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

    console.log('Reconciliation complete ✅');
  } catch (err) {
    console.error('Reconciliation error:', err);
  } finally {
    await pool.end();
  }
}

reconcileAll();
