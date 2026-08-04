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
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'student_programme_enrollments'
    `);
    console.log('student_programme_enrollments schema:');
    console.log(res.rows);

    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'student_programme_enrollments'
    `);
    console.log('\nIndexes on student_programme_enrollments:');
    console.log(indexes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
