const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
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
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB for schema backup.');

    const schemaRes = await client.query(`
      SELECT 
        table_schema,
        table_name,
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema IN ('public', 'curriculum_read')
      ORDER BY table_schema, table_name, ordinal_position;
    `);

    let backupContent = '-- Clasptek Sprint 2.3 Legacy Database Schema Backup\n\n';
    let currentTable = '';
    schemaRes.rows.forEach(r => {
      const fullTableName = `${r.table_schema}.${r.table_name}`;
      if (fullTableName !== currentTable) {
        if (currentTable !== '') {
          backupContent += ');\n\n';
        }
        currentTable = fullTableName;
        backupContent += `CREATE TABLE ${currentTable} (\n`;
      } else {
        backupContent += ',\n';
      }
      backupContent += `  ${r.column_name} ${r.data_type}${r.character_maximum_length ? '(' + r.character_maximum_length + ')' : ''} ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`;
    });
    if (currentTable !== '') {
      backupContent += '\n);\n';
    }

    const backupPath = path.resolve(__dirname, 'db_schema_legacy_resource_backup.sql');
    fs.writeFileSync(backupPath, backupContent, 'utf8');
    console.log(`Schema backup saved successfully to: ${backupPath}`);
  } catch (err) {
    console.error('Schema backup failed:', err);
  } finally {
    await client.end();
  }
}

main();
