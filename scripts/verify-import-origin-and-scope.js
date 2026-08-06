require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log('================================================================');
  console.log('    1. VERIFYING SEEDING SCRIPT AS ONLY PLACEHOLDER ORIGIN     ');
  console.log('================================================================\n');

  // Search source files for placeholder strings
  const searchDir = (dir, results = []) => {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (
        file === 'node_modules' ||
        file === '.git' ||
        file === '.next' ||
        file === 'brain' ||
        fullPath.includes('evidence-collector') ||
        fullPath.includes('master-forensic') ||
        fullPath.includes('inspect-all-option')
      )
        return;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        searchDir(fullPath, results);
      } else if (
        file.endsWith('.js') ||
        file.endsWith('.ts') ||
        file.endsWith('.json') ||
        file.endsWith('.sql') ||
        file.endsWith('.csv')
      ) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('primary objective / core model')) {
          results.push(fullPath);
        }
      }
    });
    return results;
  };

  const workspaceRoot = path.join(__dirname, '..');
  const matchingFiles = searchDir(workspaceRoot);
  console.log('Files containing "primary objective / core model":');
  matchingFiles.forEach((f) => console.log('  -', path.relative(workspaceRoot, f)));

  console.log('\n================================================================');
  console.log('    2. FULL QUESTION BANK SCOPE & INTEGRITY AUDIT (ALL SKILLS)  ');
  console.log('================================================================\n');

  const qAudit = await pool.query(`
    SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.payload,
           count(ao.id) as option_count,
           count(CASE WHEN ao.is_correct THEN 1 END) as correct_count,
           count(CASE WHEN ao.option_text LIKE '%primary objective%' THEN 1 END) as placeholder_count
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL
    GROUP BY q.id, q.code, qv.id, qv.prompt, qv.payload
    ORDER BY q.code ASC
  `);

  console.log(`Total questions analyzed across ALL skills: ${qAudit.rows.length}`);

  const sectionBreakdown = new Map();
  let totalPlaceholders = 0;
  let questionsWithNoCorrect = 0;
  let essayQuestionsWithOptionButtons = 0;

  qAudit.rows.forEach((r) => {
    let prefix = r.question_code.split('-')[1] || 'OTHER';
    if (!sectionBreakdown.has(prefix)) {
      sectionBreakdown.set(prefix, {
        total: 0,
        withOptions: 0,
        zeroOptions: 0,
        placeholders: 0,
        zeroCorrect: 0,
      });
    }
    const stat = sectionBreakdown.get(prefix);
    stat.total++;
    if (r.option_count > 0) stat.withOptions++;
    else stat.zeroOptions++;

    if (r.placeholder_count > 0) {
      stat.placeholders += Number(r.placeholder_count);
      totalPlaceholders += Number(r.placeholder_count);
    }

    if (r.option_count > 0 && r.correct_count == 0) {
      stat.zeroCorrect++;
      questionsWithNoCorrect++;
    }
  });

  console.log('\nSection Breakdown Table:');
  console.table(Object.fromEntries(sectionBreakdown));

  console.log(`\nTotal placeholder options found across entire DB: ${totalPlaceholders}`);
  console.log(`Objective questions with options but 0 correct answers: ${questionsWithNoCorrect}`);

  // Check 1-to-1 mapping of options to question versions
  const multiMapOptions = await pool.query(`
    SELECT id, count(DISTINCT question_version_id)
    FROM public.answer_options
    GROUP BY id
    HAVING count(DISTINCT question_version_id) > 1
  `);
  console.log(`Answer options belonging to >1 question version: ${multiMapOptions.rows.length}`);

  await pool.end();
}

main().catch((err) => console.error(err));
