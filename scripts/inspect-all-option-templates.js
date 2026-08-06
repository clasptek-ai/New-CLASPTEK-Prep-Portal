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
  console.log('--- INSPECTING TEMPLATE OPTION TEXTS IN DATABASE ---');

  const templateRes = await pool.query(`
    SELECT q.code as question_code, qv.id as version_id, qv.prompt, o.option_code, o.option_text
    FROM public.answer_options o
    JOIN public.question_versions qv ON qv.id = o.question_version_id
    JOIN public.questions q ON q.id = qv.question_id
    WHERE o.option_text LIKE '%primary objective%'
       OR o.option_text LIKE '%secondary alternative%'
       OR o.option_text LIKE '%Option A%'
    ORDER BY q.code ASC
  `);

  console.log(
    `Questions using generic template option texts in DB: ${templateRes.rows.length / 4}`
  );

  const sampleCodes = Array.from(new Set(templateRes.rows.map((r) => r.question_code)));
  console.log('Affected question codes:', sampleCodes);

  await pool.end();
}

main().catch((err) => console.error(err));
