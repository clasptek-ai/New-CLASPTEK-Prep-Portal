const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATION 01436 — Add unique constraint on (attempt_id, question_id) ===');
  const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/01436_add_answer_unique_constraint.sql'), 'utf8');
  await pool.query(sql);
  console.log('Migration 01436 applied successfully!');
  
  // Verify
  const idxRes = await pool.query(`
    SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'assessment_attempt_answers'
  `);
  console.log('\nIndexes on assessment_attempt_answers after migration:');
  idxRes.rows.forEach(r => console.log(`  ${r.indexname}: ${r.indexdef}`));
  
  await pool.end();
}

main().catch(err => {
  console.error('Migration 01436 error:', err);
  process.exit(1);
});
