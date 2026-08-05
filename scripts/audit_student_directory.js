require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('================================================================================');
    console.log('   DATABASE AUDIT FOR STUDENT DIRECTORY & REGISTRATION DATA BINDING');
    console.log(
      '================================================================================\n'
    );

    // 1. Inspect auth.users metadata vs profiles vs student_programme_enrollments
    const usersRes = await client.query(`
      SELECT 
        au.id,
        au.email,
        au.phone as auth_phone,
        au.raw_user_meta_data->>'first_name' as meta_fn,
        au.raw_user_meta_data->>'last_name' as meta_ln,
        au.raw_user_meta_data->>'phone' as meta_phone,
        au.raw_user_meta_data->>'programme' as meta_programme,
        p.id as profile_id,
        p.first_name as prof_fn,
        p.last_name as prof_ln,
        p.phone as prof_phone,
        p.target_programme as prof_programme,
        spe.programme_id as spe_prog_id,
        spe.cohort_id as spe_cohort_id
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.user_id = au.id
      LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id
      LIMIT 20
    `);

    console.log(`Inspected ${usersRes.rows.length} User Records:\n`);
    for (const r of usersRes.rows) {
      console.log(`User ID: ${r.id} | Email: ${r.email}`);
      console.log(`  auth.users.phone:                        ${r.auth_phone || 'NULL'}`);
      console.log(`  auth.users.raw_user_meta_data->phone:    ${r.meta_phone || 'NULL'}`);
      console.log(`  auth.users.raw_user_meta_data->programme:${r.meta_programme || 'NULL'}`);
      console.log(`  public.profiles.phone:                   ${r.prof_phone || 'NULL'}`);
      console.log(`  public.profiles.target_programme:        ${r.prof_programme || 'NULL'}`);
      console.log(`  student_programme_enrollments.prog_id:   ${r.spe_prog_id || 'NULL'}\n`);
    }

    // 2. Check table structures
    const profileCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    `);
    console.log('public.profiles Column Schema:');
    console.log(profileCols.rows.map((c) => `${c.column_name} (${c.data_type})`).join(', '));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Audit script error:', err);
  process.exit(1);
});
