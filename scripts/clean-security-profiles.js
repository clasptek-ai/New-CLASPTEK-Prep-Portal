const { Pool } = require('pg');
require('dotenv').config();

async function cleanOrphanSecurityProfiles() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  const res = await pool.query(
    'DELETE FROM public.security_profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  console.log(`Deleted ${res.rowCount} orphan security_profiles records.`);

  const check = await pool.query(
    'SELECT COUNT(*) FROM public.security_profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  console.log(
    `Orphan Security Profiles Remaining: ${check.rows[0].count} ${check.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );

  await pool.end();
}

cleanOrphanSecurityProfiles().catch((err) => console.error(err));
