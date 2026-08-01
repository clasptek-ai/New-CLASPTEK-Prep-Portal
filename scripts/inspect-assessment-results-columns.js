const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'assessment_results'
    ORDER BY ordinal_position
  `);
  console.log('assessment_results columns:');
  res.rows.forEach((r) => console.log(`  - ${r.column_name} (${r.data_type})`));
  await pool.end();
}

main();
