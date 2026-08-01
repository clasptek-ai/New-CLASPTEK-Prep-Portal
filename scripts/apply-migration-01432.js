const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== APPLYING MIGRATION 01432: PRODUCTION ASSESSMENT ENGINE ARCHITECTURE ===');
  const sqlPath = path.join(__dirname, '../supabase/migrations/01432_production_assessment_engine_architecture.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(sql);
  console.log('Migration 01432 applied successfully!');

  const defs = await pool.query(`SELECT id, code, exam_type, title, assessment_type, duration_minutes, status FROM public.assessment_definitions`);
  console.log('Assessment Definitions in DB:', defs.rows);

  const assigns = await pool.query(`SELECT * FROM public.programme_assessment_assignments`);
  console.log('Programme Assignments in DB:', assigns.rows);

  await pool.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
