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
  console.log('--- DIRECT DATABASE QUERY FOR Q-READ-008, 009, 010 ---');

  const res = await pool.query(`
    SELECT q.code as question_code, qv.id as version_id, qv.prompt,
           o.id as option_id, o.option_code, o.option_text, o.is_correct, o.display_order
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.answer_options o ON o.question_version_id = qv.id
    WHERE q.code IN ('Q-READ-008', 'Q-READ-009', 'Q-READ-010')
    ORDER BY q.code, o.display_order
  `);

  console.log('Database rows for Q-READ-008, 009, 010:');
  console.table(res.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
