const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const dbUrl = (process.env.DATABASE_URL || '').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  );
  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const res = await pool.query(`
    SELECT
      conname,
      pg_get_constraintdef(oid) AS constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.assessment_results'::regclass;
  `);

  console.log('--- Constraints on public.assessment_results ---');
  console.table(res.rows);

  const idxRes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'assessment_results';
  `);

  console.log('\n--- Indexes on public.assessment_results ---');
  console.table(idxRes.rows);

  await pool.end();
}

main().catch(console.error);
