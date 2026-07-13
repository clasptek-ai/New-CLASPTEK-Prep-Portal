const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const migrationDir = path.resolve(__dirname, '../database/migrations');

async function main() {
  console.log('=========================================');
  console.log('PostgreSQL Database Migration Orchestrator');
  console.log('=========================================');

  // Rely on the validated environment loader values
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Startup Failure: DATABASE_URL parameter is absent.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL datastore.');

    // Ensure infrastructure migrations log table is initialized
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Retrieve local sql migration scripts
    if (!fs.existsSync(migrationDir)) {
      console.log('Migrations directory not found. Creating...');
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const files = fs
      .readdirSync(migrationDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Verify ordering sequence constraints
    const prefixes = files.map((f) => {
      const match = f.match(/^(\d+)_/);
      if (!match) {
        console.error(
          `❌ Validation Failure: migration file "${f}" does not conform to format (e.g. 00001_name.sql)`
        );
        process.exit(1);
      }
      return match[1];
    });

    const uniquePrefixes = new Set(prefixes);
    if (uniquePrefixes.size !== prefixes.length) {
      console.error(
        '❌ Validation Failure: Duplicate sequence prefixes detected in migrations list.'
      );
      process.exit(1);
    }

    // Verify against database execution ledger
    const res = await client.query('SELECT name FROM migrations_log ORDER BY name ASC');
    const applied = new Set(res.rows.map((r) => r.name));
    const appliedList = Array.from(applied);

    // Verify sequence history drift
    let appliedIndex = 0;
    for (const file of files) {
      if (applied.has(file)) {
        if (appliedList[appliedIndex] !== file) {
          console.error(
            `❌ Sequence Integrity Violation: executed database ledger record "${appliedList[appliedIndex]}" out of sync with workspace file "${file}".`
          );
          process.exit(1);
        }
        appliedIndex++;
      }
    }

    // Apply pending migrations transactionally
    let appliedCount = 0;
    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`> Applying migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations_log (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✓ Migration "${file}" successfully applied.`);
          appliedCount++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Transaction Rollback: Failed to apply migration "${file}".`);
          throw err;
        }
      }
    }

    console.log('\n=========================================');
    console.log(`Migrations complete. Applied ${appliedCount} schema file(s).`);
    console.log('=========================================');
  } catch (err) {
    console.error('❌ Migration failed with critical error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
