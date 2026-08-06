require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log('--- CHECKING SUBMITTED ATTEMPTS WITHOUT ASSESSMENT_RESULTS ---');

  const res = await pool.query(`
    SELECT aa.id, aa.student_id, aa.catalog_id, aa.status, aa.submitted_at, aa.created_at,
           ar.id as result_id
    FROM assessment_attempts aa
    LEFT JOIN assessment_results ar ON ar.attempt_id = aa.id
    WHERE aa.status = 'SUBMITTED' AND ar.id IS NULL
  `);

  console.log(`Submitted attempts WITHOUT assessment_results: ${res.rows.length}`);
  console.table(res.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
