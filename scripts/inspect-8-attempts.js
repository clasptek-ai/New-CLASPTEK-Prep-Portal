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
  const res = await pool.query(`
    SELECT id, student_id, catalog_id, status, score, closed_at, submitted_at, created_at, updated_at
    FROM assessment_attempts
    WHERE id IN (
      'fe44ad67-a864-4844-9a13-02b8bfa4d194',
      '906be8fe-fea6-42a5-85ed-9a09cc268a00',
      '207a46d6-e250-48b4-8e2f-d2d7efdf0d7a',
      '6e6b799b-b33a-4d8c-8e13-177f61da5dc6',
      'd199ad65-6ae6-4f9d-b17b-7294a307b5ab',
      '6ca9362a-c9b0-414e-8a3a-730fd90843ab',
      'a937372f-7725-41ce-916d-3ff00d139cae',
      '9bc81261-62c3-46dd-a3e2-c96736cc79f3'
    )
  `);

  console.table(res.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
