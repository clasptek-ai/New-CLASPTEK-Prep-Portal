const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('====================================================');
  console.log('CANONICAL STUDENT DATA TRACE & DEEP AUDIT');
  console.log('====================================================\n');

  const usersRes = await pool.query(`
    SELECT 
      u.id as user_id,
      au.email,
      au.phone as auth_phone,
      au.raw_user_meta_data,
      p.id as profile_id,
      p.first_name,
      p.last_name,
      p.phone as profile_phone,
      p.target_programme as profile_programme
    FROM public.users u
    JOIN auth.users au ON au.id = u.id
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE u.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        JOIN public.roles r ON r.id = ur.role_id 
        WHERE ur.user_id = u.id AND r.name IN ('Super Administrator', 'Administrator', 'Support')
      )
    ORDER BY u.created_at DESC
  `);

  console.log('Real Candidates Found:', usersRes.rows.length);
  for (const u of usersRes.rows) {
    console.log(`\n--- STUDENT: ${u.first_name} ${u.last_name} (${u.email}) ---`);
    console.log(`  UUID: ${u.user_id}`);
    console.log(`  Auth Phone: ${u.auth_phone}`);
    console.log(`  Profile Phone: ${u.profile_phone}`);
    console.log(`  Raw Meta Data:`, u.raw_user_meta_data);

    // Check student_programme_enrollments
    const enrollRes = await pool.query(
      `SELECT * FROM public.student_programme_enrollments WHERE student_id = $1`,
      [u.user_id]
    );
    console.log(`  Enrollments (${enrollRes.rows.length}):`, enrollRes.rows);
  }

  // Inspect programmes and cohorts tables
  console.log('\n=== EXISTING PROGRAMMES TABLE ===');
  const progRes = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%program%' OR table_name LIKE '%cohort%'`);
  console.log('Programme/Cohort Tables:', progRes.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
