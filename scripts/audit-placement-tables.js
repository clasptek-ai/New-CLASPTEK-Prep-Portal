require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log('--- AUDITING PLACEMENT_RESULTS AND DIAGNOSTIC_ATTEMPTS ---\n');

  try {
    const prRes = await pool.query('SELECT * FROM public.placement_results');
    console.log(`public.placement_results row count: ${prRes.rows.length}`);
  } catch (err) {
    console.log(`public.placement_results query error: ${err.message}`);
  }

  try {
    const daRes = await pool.query(
      'SELECT id, student_id, status, duration_minutes FROM public.diagnostic_attempts ORDER BY created_at DESC LIMIT 5'
    );
    console.log(`public.diagnostic_attempts row count: ${daRes.rows.length}`);
    daRes.rows.forEach((r) => console.log('  da:', r));
  } catch (err) {
    console.log(`public.diagnostic_attempts query error: ${err.message}`);
  }

  await pool.end();
}

main().catch((err) => console.error(err));
