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
    console.log('   BACKFILL & DATA INTEGRITY AUDIT FOR STUDENT DIRECTORY');
    console.log('================================================================================\n');

    // 1. Backfill profiles from raw_user_meta_data
    const backfillRes = await client.query(`
      UPDATE public.profiles p
      SET phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone', au.phone),
          target_programme = COALESCE(p.target_programme, au.raw_user_meta_data->>'programme')
      FROM auth.users au
      WHERE au.id = p.user_id
        AND (p.phone IS NULL OR p.target_programme IS NULL)
      RETURNING p.user_id, p.phone, p.target_programme
    `);

    console.log(`Backfilled ${backfillRes.rows.length} profile records.\n`);

    // 2. Query Student Directory API Query
    const res = await client.query(`
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
      LIMIT 10
    `);

    console.log('Sample Candidate Output from Student Directory Query:');
    for (const row of res.rows) {
      console.log(`Candidate: ${row.first_name} ${row.last_name} (${row.email})`);
      console.log(`  Phone:     ${row.phone}`);
      console.log(`  Programme: ${row.programme}`);
      console.log(`  Cohort:    ${row.cohort}\n`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
