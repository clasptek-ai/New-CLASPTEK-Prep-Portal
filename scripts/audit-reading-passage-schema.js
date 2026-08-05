const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function auditDatabaseSchema() {
  console.log('=== READING PASSAGE QUESTION LINKAGE AUDIT ===\n');

  // 1. Passage count & list
  const passages = await pool.query(`SELECT id, code, title FROM reading_passages`);
  console.log(`Found ${passages.rows.length} Reading Passages in DB:`);

  for (const p of passages.rows) {
    // Check questions linked via passageCode in payload OR via code pattern
    const linkedQRes = await pool.query(
      `
      SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.payload
      FROM questions q
      JOIN question_versions qv ON qv.question_id = q.id
      WHERE (qv.payload->>'passageCode' = $1 OR qv.payload->>'passageCode' = $2 OR q.code ILIKE $3)
        AND q.deleted_at IS NULL
    `,
      [p.code, p.id, `%${p.code}%`]
    );

    console.log(`\nPassage Code: ${p.code} | Title: "${p.title}"`);
    console.log(`- Linked Questions Count: ${linkedQRes.rows.length}`);
    linkedQRes.rows.forEach((q, idx) => {
      console.log(
        `  Q${idx + 1}: [ID: ${q.question_id}] Code: ${q.question_code} | Prompt: "${q.prompt}"`
      );
    });
  }

  await pool.end();
}

auditDatabaseSchema().catch((err) => {
  console.error('Audit DB error:', err);
  process.exit(1);
});
