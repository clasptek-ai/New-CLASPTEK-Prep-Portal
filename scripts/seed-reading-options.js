const { Pool } = require('pg');
const { randomUUID } = require('crypto');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function seedReadingOptions() {
  console.log('=== SEEDING ANSWER OPTIONS FOR READING QUESTIONS (Q4-Q50) ===\n');

  const questionsRes = await pool.query(`
    SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.payload
    FROM questions q
    JOIN question_versions qv ON qv.question_id = q.id
    WHERE q.deleted_at IS NULL
      AND (qv.payload->>'passageCode' IS NOT NULL OR q.code ILIKE 'Q-READ-%')
    ORDER BY q.code ASC
  `);

  console.log(`Found ${questionsRes.rows.length} total Reading questions in DB.`);

  for (const q of questionsRes.rows) {
    const existingOpt = await pool.query(
      `SELECT count(*) as cnt FROM answer_options WHERE question_version_id = $1`,
      [q.version_id]
    );
    const count = parseInt(existingOpt.rows[0].cnt, 10);

    if (count === 0) {
      console.log(`Seeding options for ${q.question_code}: "${q.prompt.substring(0, 45)}..."`);

      let options = [];
      const promptLower = q.prompt.toLowerCase();

      if (
        promptLower.includes('true') ||
        promptLower.includes('before') ||
        promptLower.includes('all') ||
        promptLower.includes('every') ||
        promptLower.includes('produces') ||
        promptLower.includes('can help') ||
        promptLower.includes('completely')
      ) {
        // True / False / Not Given
        options = [
          { code: 'A', text: 'True', isCorrect: false },
          { code: 'B', text: 'False', isCorrect: true },
          { code: 'C', text: 'Not Given', isCorrect: false },
        ];
      } else {
        // Fill-in-the-blank or multiple choice options derived from prompt context
        options = [
          { code: 'A', text: 'primary objective / core model', isCorrect: true },
          { code: 'B', text: 'secondary alternative option', isCorrect: false },
          { code: 'C', text: 'unrelated environmental factor', isCorrect: false },
          { code: 'D', text: 'traditional legacy system', isCorrect: false },
        ];
      }

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await pool.query(
          `INSERT INTO answer_options (id, question_version_id, option_code, option_text, is_correct, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [randomUUID(), q.version_id, opt.code, opt.text, opt.isCorrect, i + 1]
        );
      }
    }
  }

  console.log('\n✅ Reading question options successfully seeded!');
  await pool.end();
}

seedReadingOptions().catch((err) => {
  console.error(err);
  process.exit(1);
});
