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
  console.log('--- AUDITING ALL ASSESSMENT_RESULTS ROWS FOR FRONTEND CRASH RISKS ---\n');
  const res = await pool.query('SELECT * FROM public.assessment_results');
  console.log(`Total rows in public.assessment_results: ${res.rows.length}`);

  res.rows.forEach((row, i) => {
    console.log(`\nRow #${i + 1} (ID: ${row.id}, AttemptID: ${row.attempt_id}):`);

    // Parse section_scores
    let secScores = row.section_scores;
    if (typeof secScores === 'string') {
      try {
        secScores = JSON.parse(secScores);
      } catch (e) {
        secScores = 'INVALID_JSON';
      }
    }
    console.log(
      `  section_scores: type=${typeof secScores}, isArray=${Array.isArray(secScores)}, value=`,
      secScores
    );

    // Parse strengths
    let strengths = row.strengths;
    if (typeof strengths === 'string') {
      try {
        strengths = JSON.parse(strengths);
      } catch (e) {
        strengths = 'INVALID_JSON';
      }
    }
    console.log(
      `  strengths: type=${typeof strengths}, isArray=${Array.isArray(strengths)}, value=`,
      strengths
    );

    // Parse weaknesses
    let weaknesses = row.weaknesses;
    if (typeof weaknesses === 'string') {
      try {
        weaknesses = JSON.parse(weaknesses);
      } catch (e) {
        weaknesses = 'INVALID_JSON';
      }
    }
    console.log(
      `  weaknesses: type=${typeof weaknesses}, isArray=${Array.isArray(weaknesses)}, value=`,
      weaknesses
    );

    // Test frontend compatibility
    try {
      if (!Array.isArray(secScores)) throw new Error('sectionScores is not an array!');
      secScores.map((s) => s.sectionCode);
      if (!Array.isArray(strengths)) throw new Error('strengths is not an array!');
      strengths.map((s) => s);
      if (!Array.isArray(weaknesses)) throw new Error('weaknesses/focusAreas is not an array!');
      weaknesses.map((w) => w);
      console.log('  Frontend Compatibility: OK ✅');
    } catch (err) {
      console.log(`  Frontend Compatibility: CRASH ❌ (${err.message})`);
    }
  });

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
