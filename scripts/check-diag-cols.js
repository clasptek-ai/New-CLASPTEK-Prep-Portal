const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function checkDiagnosticAttempts() {
  const colRes = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'diagnostic_attempts'
    ORDER BY ordinal_position
  `);
  console.log('Columns of [public.diagnostic_attempts]:');
  colRes.rows.forEach((r) => {
    console.log(`  - ${r.column_name.padEnd(25)} | ${r.data_type}`);
  });
  await pool.end();
}

checkDiagnosticAttempts();
