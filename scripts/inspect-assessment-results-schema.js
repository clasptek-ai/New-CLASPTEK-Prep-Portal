const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const dbUrl = (process.env.DATABASE_URL || '').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  );
  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const res = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessment_results'
    ORDER BY ordinal_position;
  `);

  console.log('--- public.assessment_results Schema ---');
  console.table(res.rows);

  await pool.end();
}

main().catch(console.error);
