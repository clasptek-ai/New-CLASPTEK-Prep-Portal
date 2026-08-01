const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function inspect() {
  // question_versions columns
  const qvCols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'question_versions'
    ORDER BY ordinal_position
  `);
  console.log('\n--- question_versions columns ---');
  qvCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} nullable:${c.is_nullable}`));

  // answer_options columns
  const aoCols = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'answer_options'
    ORDER BY ordinal_position
  `);
  console.log('\n--- answer_options columns ---');
  aoCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(30)} ${c.data_type}`));

  // writing_tasks columns
  const wtCols = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'writing_tasks'
    ORDER BY ordinal_position
  `);
  console.log('\n--- writing_tasks columns ---');
  wtCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(30)} ${c.data_type}`));

  // Sample question_versions row
  const sampleQV = await pool.query(`SELECT * FROM public.question_versions LIMIT 1`);
  console.log('\n--- sample question_versions row keys ---');
  if (sampleQV.rows.length > 0) console.log(Object.keys(sampleQV.rows[0]));
  else console.log('  (no rows)');

  // Sample answer_options row
  const sampleAO = await pool.query(`SELECT * FROM public.answer_options LIMIT 3`);
  console.log('\n--- sample answer_options rows ---');
  sampleAO.rows.forEach(r => console.log(r));

  // Check for correct_option_code or is_correct column
  const correctCol = await pool.query(`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name IN ('correct_option_code', 'is_correct_answer', 'correct_answer', 'is_correct')
    ORDER BY table_name, column_name
  `);
  console.log('\n--- columns named correct_* or is_correct ---');
  correctCol.rows.forEach(r => console.log(`  ${r.table_name}.${r.column_name}`));

  await pool.end();
}

inspect().catch(e => { console.error(e.message); process.exit(1); });
