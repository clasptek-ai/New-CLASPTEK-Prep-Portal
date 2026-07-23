const { Client } = require('pg');
require('dotenv').config({ path: 'apps/web/.env.local' });

async function main() {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set in env');
    process.exit(1);
  }
  dbUrl = dbUrl.replace('sslmode=verify-full', 'sslmode=no-verify');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to DB successfully.\n');

    // 1. Get all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('--- Writable Tables in public ---');
    tablesRes.rows.forEach((r) => console.log(`- ${r.table_name}`));
    console.log(`Total public tables: ${tablesRes.rows.length}\n`);

    // 2. Get all tables in curriculum_read schema
    const readTablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'curriculum_read' 
      ORDER BY table_name;
    `);
    console.log('--- Tables in curriculum_read ---');
    readTablesRes.rows.forEach((r) => console.log(`- ${r.table_name}`));
    console.log(`Total curriculum_read tables: ${readTablesRes.rows.length}\n`);

    // 3. Get all foreign keys
    const fkRes = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `);
    console.log('--- Foreign Keys ---');
    fkRes.rows.forEach((r) =>
      console.log(
        `- ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`
      )
    );
    console.log(`Total foreign keys: ${fkRes.rows.length}\n`);

    // 4. Get RLS policies
    const rlsRes = await client.query(`
      SELECT tablename, policyname, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    console.log('--- Row Level Security Policies ---');
    rlsRes.rows.forEach((r) =>
      console.log(`- Table: ${r.tablename} | Policy: ${r.policyname} | command: ${r.cmd}`)
    );
    console.log(`Total RLS policies: ${rlsRes.rows.length}\n`);

    // 5. Get all indexes
    const idxRes = await client.query(`
      SELECT
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name
      FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
      WHERE
        t.oid = ix.indrelid
        and i.oid = ix.indexrelid
        and a.attrelid = t.oid
        and a.attnum = any(ix.indkey)
        and t.relkind = 'r'
        and t.relname not like 'pg_%'
        and t.relname not like 'sql_%'
      ORDER BY
        t.relname,
        i.relname;
    `);
    console.log('--- Indexes ---');
    idxRes.rows.forEach((r) =>
      console.log(`- Table: ${r.table_name} | Index: ${r.index_name} | Column: ${r.column_name}`)
    );
    console.log(`Total indexes: ${idxRes.rows.length}\n`);
  } catch (err) {
    console.error('Error running audit:', err);
  } finally {
    await client.end();
  }
}

main();
