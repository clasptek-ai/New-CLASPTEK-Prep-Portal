import { Client } from 'pg';
import 'dotenv/config';

async function main() {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not configured.');
    process.exit(1);
  }
  dbUrl = dbUrl.replace('sslmode=verify-full', 'sslmode=no-verify');
  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    // Query triggers
    const res = await client.query(`
      SELECT event_object_table AS table_name, trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_table IN ('module_prerequisites', 'module_sequences', 'module_learning_outcomes', 'learning_modules')
    `);
    console.log('Triggers:');
    console.log(JSON.stringify(res.rows, null, 2));

    // Also query constraints
    const resCons = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid::regclass::text IN ('public.module_learning_outcomes', 'public.module_prerequisites', 'public.module_sequences', 'public.learning_modules')
    `);
    console.log('Constraints:');
    console.log(JSON.stringify(resCons.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
