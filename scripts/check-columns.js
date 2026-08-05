const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function inspectTables() {
  const aaCols = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessment_attempts'
  `);
  console.log(
    'assessment_attempts columns:',
    aaCols.rows.map((r) => r.column_name)
  );

  const maCols = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'media_assets'
  `);
  console.log(
    'media_assets columns:',
    maCols.rows.map((r) => r.column_name)
  );

  await pool.end();
}

inspectTables().catch(console.error);
