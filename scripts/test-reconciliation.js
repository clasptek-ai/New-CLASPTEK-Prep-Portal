const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== CANONICAL STUDENT DIRECTORY QUERY TEST (Casting UUIDs) ===');

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

  console.log('Query result rows:', res.rows.length);
  console.log(JSON.stringify(res.rows, null, 2));

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
