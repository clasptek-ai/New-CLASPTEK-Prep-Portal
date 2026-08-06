require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== AUDITING DATABASE SCHEMA FOR STUDENT DIRECTORY & AUTH ===\n');

  const tables = [
    'users',
    'profiles',
    'student_programme_enrollments',
    'identities',
    'security_profiles',
  ];

  for (const table of tables) {
    const cols = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`--- Table: public.${table} (${cols.rows.length} columns) ---`);
    console.table(cols.rows);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
