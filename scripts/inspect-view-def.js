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
    SELECT view_definition
    FROM information_schema.views
    WHERE table_name = 'diagnostic_attempts'
  `);
  console.log('VIEW DEFINITION FOR diagnostic_attempts:');
  console.log(res.rows[0]?.view_definition);

  await pool.end();
}

main().catch((err) => console.error(err));
