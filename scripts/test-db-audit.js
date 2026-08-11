const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function runAudit() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('DATABASE_URL present:', !!dbUrl);

  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const res = await pool.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('users', 'profiles', 'identities', 'security_profiles');
    `);

    console.log('\n--- Foreign Key Constraints ---');
    console.table(res.rows);

    const triggers = await pool.query(`
      SELECT 
        trigger_schema,
        event_object_table,
        trigger_name,
        action_statement,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE event_object_table IN ('users', 'profiles', 'identities', 'security_profiles');
    `);

    console.log('\n--- Public Schema Triggers ---');
    console.table(triggers.rows);

    const authTriggers = await pool.query(`
      SELECT 
        trigger_schema,
        event_object_table,
        trigger_name,
        action_statement,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    `);

    console.log('\n--- Auth Schema Triggers ---');
    console.table(authTriggers.rows);
  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    await pool.end();
  }
}

runAudit();
