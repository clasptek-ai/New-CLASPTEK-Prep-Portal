const { Pool } = require('pg');
require('dotenv').config();

async function inspectTables() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('All public schema tables:');
  console.table(tables.rows);

  await pool.end();
}

inspectTables().catch((err) => console.error(err));
