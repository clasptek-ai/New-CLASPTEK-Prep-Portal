const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres',
  ssl: { rejectUnauthorized: false },
});

async function applyMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/01440_ielts_reading_canonical_types.sql'),
      'utf8'
    );
    await pool.query(sql);
    console.log('Successfully applied migration 01440_ielts_reading_canonical_types.sql');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

applyMigration();
