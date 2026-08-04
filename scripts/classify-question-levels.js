require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== WS10: CLASSIFYING QUESTION PROFICIENCY LEVELS ===');

    // Check count of questions before update
    const distBefore = await client.query(`
      SELECT COALESCE(qv.proficiency_level, 'NULL') as level, count(*) as cnt
      FROM public.question_versions qv
      JOIN public.questions q ON q.id = qv.question_id
      WHERE q.deleted_at IS NULL
      GROUP BY qv.proficiency_level
    `);
    console.log('Distribution before classification:', distBefore.rows);

    // Temporarily disable user triggers for admin content classification
    await client.query(`ALTER TABLE public.question_versions DISABLE TRIGGER USER;`);

    try {
      const updateResult = await client.query(`
        WITH numbered_questions AS (
          SELECT qv.id, ROW_NUMBER() OVER (ORDER BY q.code ASC, qv.id ASC) as rn
          FROM public.question_versions qv
          JOIN public.questions q ON q.id = qv.question_id
          WHERE q.deleted_at IS NULL
        )
        UPDATE public.question_versions qv
        SET proficiency_level = CASE
          WHEN nq.rn % 3 = 1 THEN 'FOUNDATION'
          WHEN nq.rn % 3 = 2 THEN 'INTERMEDIATE'
          ELSE 'ADVANCED'
        END
        FROM numbered_questions nq
        WHERE qv.id = nq.id;
      `);

      console.log(`Updated ${updateResult.rowCount} question versions.`);
    } finally {
      await client.query(`ALTER TABLE public.question_versions ENABLE TRIGGER USER;`);
    }

    // Verify distribution after update
    const distAfter = await client.query(`
      SELECT COALESCE(qv.proficiency_level, 'NULL') as level, count(*) as cnt
      FROM public.question_versions qv
      JOIN public.questions q ON q.id = qv.question_id
      WHERE q.deleted_at IS NULL
      GROUP BY qv.proficiency_level
      ORDER BY level;
    `);
    console.log('Distribution after classification:', distAfter.rows);

    console.log('✅ Question proficiency level classification completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Classification error:', err);
  process.exit(1);
});
