require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function runProductionBackfill() {
  const client = await pool.connect();
  try {
    console.log('================================================================================');
    console.log('   PRODUCTION STUDENT DIRECTORY DATA RECONCILIATION & BACKFILL');
    console.log('================================================================================\n');

    // 1. Backfill profiles from raw_user_meta_data
    const res1 = await client.query(`
      UPDATE public.profiles p
      SET phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone', au.phone),
          target_programme = COALESCE(p.target_programme, au.raw_user_meta_data->>'programme')
      FROM auth.users au
      WHERE au.id = p.user_id
        AND (p.phone IS NULL OR p.target_programme IS NULL)
      RETURNING p.user_id, p.phone, p.target_programme
    `);

    console.log(`1. Reconciled ${res1.rows.length} existing candidate profile records in public.profiles.`);

    // 2. Set default programme for candidates who registered without selecting a programme
    const res2 = await client.query(`
      UPDATE public.profiles
      SET target_programme = 'English Proficiency'
      WHERE target_programme IS NULL
      RETURNING user_id
    `);

    console.log(`2. Updated ${res2.rows.length} candidate profiles with default target_programme ('English Proficiency').`);

    // 3. Verify total candidates and fields
    const checkRes = await client.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE p.phone IS NOT NULL AND p.phone <> 'NOT RECORDED') as recorded_phones,
        COUNT(*) FILTER (WHERE p.target_programme IS NOT NULL AND p.target_programme <> 'UNASSIGNED') as assigned_programmes
      FROM public.users u
      JOIN auth.users au ON au.id = u.id
      LEFT JOIN public.profiles p ON p.user_id = u.id
    `);

    console.log('\n--------------------------------------------------------------------------------');
    console.log('RECONCILIATION VERIFICATION METRICS:');
    console.log(`  Total Registered Students:      ${checkRes.rows[0].total_students}`);
    console.log(`  Recorded Phone Contacts:        ${checkRes.rows[0].recorded_phones}`);
    console.log(`  Assigned Target Programmes:    ${checkRes.rows[0].assigned_programmes}`);
    console.log('--------------------------------------------------------------------------------');
    console.log('✅ PRODUCTION BACKFILL & RECONCILIATION COMPLETED SUCCESSFULLY');

  } finally {
    client.release();
    await pool.end();
  }
}

runProductionBackfill().catch((err) => {
  console.error('Backfill error:', err);
  process.exit(1);
});
