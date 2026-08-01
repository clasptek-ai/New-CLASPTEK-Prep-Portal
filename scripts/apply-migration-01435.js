const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATION 01435 ===');
  const mPath = path.join(__dirname, '../supabase/migrations/01435_unify_assessment_attempts_schema.sql');
  const sql = fs.readFileSync(mPath, 'utf8');
  await pool.query(sql);
  console.log('Migration 01435 applied successfully!');
  await pool.end();
}

main().catch(err => {
  console.error('Migration 01435 error:', err);
  process.exit(1);
});
