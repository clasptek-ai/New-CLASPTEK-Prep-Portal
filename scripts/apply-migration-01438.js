const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATION 01438 — RC1 Database Integrity & Performance Indexes ===');
  const sql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/01438_rc1_database_integrity.sql'),
    'utf8'
  );

  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
  for (const stmt of statements) {
    if (!stmt) continue;
    try {
      await pool.query(stmt);
      console.log(`  OK: ${stmt.slice(0, 80).replace(/\n/g, ' ')}...`);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('already exists')) {
        console.log(`  SKIP (already exists): ${stmt.slice(0, 60).replace(/\n/g, ' ')}...`);
      } else {
        console.error(`  ERROR: ${msg}`);
        console.error(`  Statement: ${stmt.slice(0, 200)}`);
      }
    }
  }

  // Verify indexes created
  console.log('\n=== VERIFYING INDEXES ===');
  const idxRes = await pool.query(`
    SELECT indexname, indexdef FROM pg_indexes 
    WHERE tablename IN ('assessment_attempts', 'assessment_attempt_events', 'assessment_attempt_answers')
    ORDER BY tablename, indexname
  `);
  idxRes.rows.forEach(r => console.log(`  ${r.indexname}: ${r.indexdef.replace(/\s+/g, ' ')}`));

  console.log('\nMigration 01438 applied successfully!');
  await pool.end();
}

main().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
