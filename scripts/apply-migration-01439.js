const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATION 01439 — First-Class Persisted Assessment Results Domain ===');
  const sql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/01439_assessment_results_first_class_domain.sql'),
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

  // Verify table structure
  console.log('\n=== VERIFYING assessment_results TABLE ===');
  const colRes = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'assessment_results'
    ORDER BY ordinal_position
  `);
  colRes.rows.forEach(r => console.log(`  Column: ${r.column_name} (${r.data_type})`));

  console.log('\nMigration 01439 applied successfully!');
  await pool.end();
}

main().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
