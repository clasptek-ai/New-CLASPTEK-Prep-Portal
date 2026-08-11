const { Pool } = require('pg');
require('dotenv').config();

async function inspectTriggers() {
  console.log('=================================================================');
  console.log('DATABASE TRIGGERS & PROCEDURES FORENSIC AUDIT');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // 1. Triggers on auth.users and public tables
  const triggersRes = await pool.query(`
    SELECT
      event_object_schema AS table_schema,
      event_object_table AS table_name,
      trigger_name,
      event_manipulation AS event,
      action_statement AS action
    FROM information_schema.triggers
    WHERE event_object_schema IN ('auth', 'public')
    ORDER BY event_object_schema, event_object_table
  `);

  console.log(`Active Triggers (${triggersRes.rows.length}):`);
  console.table(triggersRes.rows);

  // 2. Custom Trigger Functions Body
  const trigFuncs = await pool.query(`
    SELECT
      p.proname AS function_name,
      pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('auth', 'public')
      AND (p.proname LIKE '%user%' OR p.proname LIKE '%profile%' OR p.proname LIKE '%auth%')
  `);

  console.log(`\nTrigger Functions Defs (${trigFuncs.rows.length}):`);
  for (const f of trigFuncs.rows) {
    console.log(`\n--- FUNCTION: ${f.function_name} ---`);
    console.log(f.definition);
  }

  await pool.end();
}

inspectTriggers().catch((err) => console.error(err));
