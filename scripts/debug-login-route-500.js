require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const userId = '0d325b3b-d988-4eac-b1b4-2fae1e329c64';

  console.log('Testing user_roles query...');
  const rolesRes = await pool.query(
    'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
    [userId]
  );
  console.log('Roles found:', rolesRes.rows);

  console.log('Testing identities query...');
  const identRes = await pool.query(
    'SELECT user_id FROM identities WHERE email = $1 AND deleted_at IS NULL',
    ['audit.student.1786017074254@clasptek.org']
  );
  console.log('Identities found:', identRes.rows);

  await pool.end();
}

main().catch(console.error);
