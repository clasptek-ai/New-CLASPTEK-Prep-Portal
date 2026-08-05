const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== TESTING SQL ATTEMPT RESOLUTION FOR ADMIN STUDENT PROFILE ===\n');

  // Fetch all registered users in auth.users
  const authUsers = await pool.query(`
    SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10
  `);

  console.log(`Found ${authUsers.rows.length} auth.users records:`);
  for (const u of authUsers.rows) {
    const attempts = await pool.query(
      `
      SELECT
        att.id AS attempt_id,
        att.student_id,
        att.status,
        COALESCE(res.overall_score, att.score, 0) AS score,
        COALESCE(res.cefr_level, 'B1') AS cefr,
        COALESCE(res.predicted_band, 'Band 6.5') AS predicted_band
      FROM public.assessment_attempts att
      LEFT JOIN public.assessment_results res ON att.id = res.attempt_id
      LEFT JOIN public.profiles p ON (att.student_id::text = p.id::text OR att.student_id::text = p.user_id::text)
      LEFT JOIN auth.users au ON (att.student_id::text = au.id::text OR p.user_id = au.id)
      WHERE att.student_id::text = $1
         OR p.id::text = $1
         OR p.user_id::text = $1
         OR au.id::text = $1
         OR au.email = $1
         OR $1 IN ('all', 'latest')
      ORDER BY att.created_at DESC
    `,
      [u.id]
    );

    console.log(`User ${u.id} (${u.email}): ${attempts.rows.length} attempts found.`);
    attempts.rows.forEach((a) => {
      console.log(
        `  -> Attempt ${a.attempt_id}: Status=${a.status}, Score=${a.score}%, CEFR=${a.cefr}, Band=${a.predicted_band}`
      );
    });
  }

  await pool.end();
}

main().catch(console.error);
