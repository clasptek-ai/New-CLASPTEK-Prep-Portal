const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATIONS 01433 & 01434 ===');
  
  const m1433Path = path.join(__dirname, '../supabase/migrations/01433_fix_diagnostic_attempts_status_constraint.sql');
  const sql1433 = fs.readFileSync(m1433Path, 'utf8');
  await pool.query(sql1433);
  console.log('Migration 01433 applied successfully!');

  const m1434Path = path.join(__dirname, '../supabase/migrations/01434_rename_to_assessment_attempts.sql');
  const sql1434 = fs.readFileSync(m1434Path, 'utf8');
  await pool.query(sql1434);
  console.log('Migration 01434 applied successfully!');

  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'assessment_attempt%'
  `);
  console.log('Assessment attempt tables in PostgreSQL:', tables.rows);

  await pool.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
