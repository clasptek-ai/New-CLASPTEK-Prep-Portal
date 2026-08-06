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
    SELECT q.code as question_code, qv.prompt, qv.payload->>'passageCode' as passage_code,
           rp.title as passage_title, substring(rp.content from 1 for 150) as passage_snippet
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.reading_passages rp ON rp.code = qv.payload->>'passageCode'
    WHERE q.code IN (
      'Q-READ-006', 'Q-READ-007', 'Q-READ-008', 'Q-READ-009', 'Q-READ-010',
      'Q-READ-016', 'Q-READ-017', 'Q-READ-018', 'Q-READ-019', 'Q-READ-020',
      'Q-READ-025', 'Q-READ-026', 'Q-READ-027', 'Q-READ-028', 'Q-READ-029', 'Q-READ-030',
      'Q-READ-034', 'Q-READ-036', 'Q-READ-037', 'Q-READ-038', 'Q-READ-039', 'Q-READ-040',
      'Q-READ-044', 'Q-READ-046', 'Q-READ-047', 'Q-READ-048', 'Q-READ-049', 'Q-READ-050'
    )
    ORDER BY q.code ASC
  `);

  console.table(res.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
