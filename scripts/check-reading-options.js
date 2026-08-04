const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function checkOptions() {
  console.log('=== CHECKING READING QUESTION OPTIONS IN DB ===\n');
  const res = await pool.query(`
    SELECT q.id, q.code, qv.id as version_id, qv.prompt, qv.payload,
           (SELECT json_agg(json_build_object('code', option_code, 'text', option_text, 'is_correct', is_correct))
            FROM answer_options WHERE question_version_id = qv.id) as options
    FROM questions q
    JOIN question_versions qv ON qv.question_id = q.id
    WHERE qv.payload->>'passageCode' = 'PAS-READ-001'
    ORDER BY q.code ASC
  `);

  res.rows.forEach((r, idx) => {
    console.log(`Q${idx + 1} [${r.code}]: prompt="${r.prompt}" | optionsCount=${r.options ? r.options.length : 0}`);
    if (r.options) console.log('  options:', JSON.stringify(r.options));
    else console.log('  options: NONE (NULL)');
  });

  await pool.end();
}

checkOptions().catch(err => {
  console.error(err);
  process.exit(1);
});
