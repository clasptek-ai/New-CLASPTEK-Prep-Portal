const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function runConstraintsCheck() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const res = await pool.query(`
      SELECT 
        conname AS constraint_name,
        rel.relname AS table_name,
        frel.relname AS foreign_table_name,
        pg_get_constraintdef(c.oid) AS constraint_definition
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      LEFT JOIN pg_class frel ON frel.oid = c.confrelid
      WHERE nsp.nspname = 'public' AND rel.relname IN ('users', 'profiles', 'identities', 'security_profiles');
    `);

    console.log('\n--- ALL CONSTRAINTS ON PUBLIC TABLES ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

runConstraintsCheck();
