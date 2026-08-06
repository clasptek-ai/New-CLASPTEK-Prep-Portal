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
  const res = await pool.query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_name IN ('diagnostic_attempts', 'assessment_attempts')
  `);
  console.log(res.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
