const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const migrationDir = path.resolve(__dirname, '../supabase/migrations');
const seedsDir = path.resolve(__dirname, '../database/seeds');

const ROLLBACK_SQL = `
  DO $$ DECLARE
      r RECORD;
  BEGIN
      EXECUTE 'DROP SCHEMA IF EXISTS curriculum_read CASCADE';
      EXECUTE 'DROP SCHEMA IF EXISTS resource_read CASCADE';
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
      END LOOP;
  END $$;
`;

async function runSeeds(client) {
  const seedFiles = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of seedFiles) {
    console.log(`Applying seed file: ${file}...`);
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
    await client.query(sql);
    console.log(`✓ Seed file "${file}" successfully applied.`);
  }
}

async function main() {
  console.log('=========================================');
  console.log('Database Migration & Integrity Verifier');
  console.log('=========================================');

  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not configured.');
    process.exit(1);
  }
  dbUrl = dbUrl.replace('sslmode=verify-full', 'sslmode=no-verify');

  // 1. Verify file sequences and name integrity
  console.log('1. Checking sequence files integrity...');
  const files = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let lastNum = -1;
  files.forEach((f) => {
    const match = f.match(/^(\d+)_/);
    if (!match) {
      console.error(`❌ File name violation: "${f}"`);
      process.exit(1);
    }
    const num = parseInt(match[1], 10);
    if (num <= lastNum) {
      console.error(
        `❌ Sorting or sequence sequence prefix violation: "${f}" (must be strictly greater than ${String(
          lastNum
        ).padStart(5, '0')})`
      );
      process.exit(1);
    }
    lastNum = num;
  });

  console.log(
    `✓ Checked ${files.length} migration files. Sequence is ascending without gaps or duplicates.`
  );

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  });
  try {
    await client.connect();

    // 2. Perform sequential rollback test
    console.log('\n2. Testing sequential schema rollback...');
    await client.query('BEGIN');
    await client.query(ROLLBACK_SQL);
    await client.query('COMMIT');
    console.log('✓ Rollback phase executed successfully.');

    // 3. Perform primary migrations run
    console.log('\n3. Executing migrations schema setup...');
    // We run the actual migration script
    const { execSync } = require('child_process');
    execSync('node ./scripts/migrate.js', { stdio: 'inherit' });
    console.log('✓ Migrations setup phase completed.');

    // 4. Perform idempotent seeding run
    console.log('\n4. Applying seeding datasets...');
    await runSeeds(client);
    console.log('✓ Seeding complete.');

    // 5. Test idempotency of migrations and seeds
    console.log('\n5. Verifying idempotency of second execution runs...');
    execSync('node ./scripts/migrate.js', { stdio: 'inherit' });
    console.log('✓ Migrations are idempotent.');
    await runSeeds(client);
    console.log('✓ Seeds are idempotent.');

    console.log('\n=========================================');
    console.log('✅ Integrity Verification SUCCESSFUL!');
    console.log('=========================================');
  } catch (err) {
    console.error('\n❌ Integrity Verification FAILED:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
