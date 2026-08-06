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

const isApply = process.argv.includes('--apply');

// Contextual replacements for the 28 affected reading questions
const CONTEXTUAL_OPTIONS_MAP = {
  'Q-READ-006': [
    { code: 'A', text: 'True', isCorrect: true },
    { code: 'B', text: 'False', isCorrect: false },
    { code: 'C', text: 'Not Given', isCorrect: false }
  ],
  'Q-READ-007': [
    { code: 'A', text: 'home', isCorrect: true },
    { code: 'B', text: 'outer space', isCorrect: false },
    { code: 'C', text: 'underwater laboratories', isCorrect: false },
    { code: 'D', text: 'manufacturing plants', isCorrect: false }
  ],
  'Q-READ-008': [
    { code: 'A', text: 'isolation', isCorrect: true },
    { code: 'B', text: 'levitation', isCorrect: false },
    { code: 'C', text: 'high radiation', isCorrect: false },
    { code: 'D', text: 'zero gravity', isCorrect: false }
  ],
  'Q-READ-009': [
    { code: 'A', text: 'communication', isCorrect: true },
    { code: 'B', text: 'excavation', isCorrect: false },
    { code: 'C', text: 'navigation', isCorrect: false },
    { code: 'D', text: 'aviation', isCorrect: false }
  ],
  'Q-READ-010': [
    { code: 'A', text: 'hybrid', isCorrect: true },
    { code: 'B', text: 'medieval', isCorrect: false },
    { code: 'C', text: 'nomadic', isCorrect: false },
    { code: 'D', text: 'feudal', isCorrect: false }
  ],
  'Q-READ-016': [
    { code: 'A', text: 'sunlight', isCorrect: true },
    { code: 'B', text: 'geothermal heat', isCorrect: false },
    { code: 'C', text: 'sound waves', isCorrect: false },
    { code: 'D', text: 'kinetic motion', isCorrect: false }
  ],
  'Q-READ-017': [
    { code: 'A', text: 'air currents', isCorrect: true },
    { code: 'B', text: 'ocean tides', isCorrect: false },
    { code: 'C', text: 'tectonic plates', isCorrect: false },
    { code: 'D', text: 'magnetic fields', isCorrect: false }
  ],
  'Q-READ-018': [
    { code: 'A', text: 'climate', isCorrect: true },
    { code: 'B', text: 'currency', isCorrect: false },
    { code: 'C', text: 'grammatical', isCorrect: false },
    { code: 'D', text: 'topological', isCorrect: false }
  ],
  'Q-READ-019': [
    { code: 'A', text: 'weather', isCorrect: true },
    { code: 'B', text: 'orbital', isCorrect: false },
    { code: 'C', text: 'demographic', isCorrect: false },
    { code: 'D', text: 'financial', isCorrect: false }
  ],
  'Q-READ-020': [
    { code: 'A', text: 'storage', isCorrect: true },
    { code: 'B', text: 'taxation', isCorrect: false },
    { code: 'C', text: 'combustion', isCorrect: false },
    { code: 'D', text: 'translation', isCorrect: false }
  ],
  'Q-READ-025': [
    { code: 'A', text: 'True', isCorrect: false },
    { code: 'B', text: 'False', isCorrect: false },
    { code: 'C', text: 'Not Given', isCorrect: true }
  ],
  'Q-READ-026': [
    { code: 'A', text: 'vocabulary', isCorrect: true },
    { code: 'B', text: 'weightlifting', isCorrect: false },
    { code: 'C', text: 'digestion', isCorrect: false },
    { code: 'D', text: 'circulation', isCorrect: false }
  ],
  'Q-READ-027': [
    { code: 'A', text: 'empathy', isCorrect: true },
    { code: 'B', text: 'paralysis', isCorrect: false },
    { code: 'C', text: 'magnetism', isCorrect: false },
    { code: 'D', text: 'buoyancy', isCorrect: false }
  ],
  'Q-READ-028': [
    { code: 'A', text: 'reduction', isCorrect: true },
    { code: 'B', text: 'amplification', isCorrect: false },
    { code: 'C', text: 'acceleration', isCorrect: false },
    { code: 'D', text: 'multiplication', isCorrect: false }
  ],
  'Q-READ-029': [
    { code: 'A', text: 'formats', isCorrect: true },
    { code: 'B', text: 'galaxies', isCorrect: false },
    { code: 'C', text: 'elements', isCorrect: false },
    { code: 'D', text: 'dimensions', isCorrect: false }
  ],
  'Q-READ-030': [
    { code: 'A', text: 'early', isCorrect: true },
    { code: 'B', text: 'prehistoric', isCorrect: false },
    { code: 'C', text: 'infinite', isCorrect: false },
    { code: 'D', text: 'unmeasured', isCorrect: false }
  ],
  'Q-READ-034': [
    { code: 'A', text: 'True', isCorrect: true },
    { code: 'B', text: 'False', isCorrect: false },
    { code: 'C', text: 'Not Given', isCorrect: false }
  ],
  'Q-READ-036': [
    { code: 'A', text: 'patterns', isCorrect: true },
    { code: 'B', text: 'emotions', isCorrect: false },
    { code: 'C', text: 'dreams', isCorrect: false },
    { code: 'D', text: 'motives', isCorrect: false }
  ],
  'Q-READ-037': [
    { code: 'A', text: 'behavior', isCorrect: true },
    { code: 'B', text: 'DNA', isCorrect: false },
    { code: 'C', text: 'thoughts', isCorrect: false },
    { code: 'D', text: 'reflexes', isCorrect: false }
  ],
  'Q-READ-038': [
    { code: 'A', text: 'images', isCorrect: true },
    { code: 'B', text: 'dreams', isCorrect: false },
    { code: 'C', text: 'fortunes', isCorrect: false },
    { code: 'D', text: 'handprints', isCorrect: false }
  ],
  'Q-READ-039': [
    { code: 'A', text: 'privacy', isCorrect: true },
    { code: 'B', text: 'gravity', isCorrect: false },
    { code: 'C', text: 'friction', isCorrect: false },
    { code: 'D', text: 'salinity', isCorrect: false }
  ],
  'Q-READ-040': [
    { code: 'A', text: 'ethical', isCorrect: true },
    { code: 'B', text: 'accidental', isCorrect: false },
    { code: 'C', text: 'reckless', isCorrect: false },
    { code: 'D', text: 'temporary', isCorrect: false }
  ],
  'Q-READ-044': [
    { code: 'A', text: 'True', isCorrect: true },
    { code: 'B', text: 'False', isCorrect: false },
    { code: 'C', text: 'Not Given', isCorrect: false }
  ],
  'Q-READ-046': [
    { code: 'A', text: 'cities', isCorrect: true },
    { code: 'B', text: 'forests', isCorrect: false },
    { code: 'C', text: 'oceans', isCorrect: false },
    { code: 'D', text: 'deserts', isCorrect: false }
  ],
  'Q-READ-047': [
    { code: 'A', text: 'institutions', isCorrect: true },
    { code: 'B', text: 'orbits', isCorrect: false },
    { code: 'C', text: 'volcanoes', isCorrect: false },
    { code: 'D', text: 'glaciers', isCorrect: false }
  ],
  'Q-READ-048': [
    { code: 'A', text: 'centers', isCorrect: true },
    { code: 'B', text: 'clouds', isCorrect: false },
    { code: 'C', text: 'canyons', isCorrect: false },
    { code: 'D', text: 'trenches', isCorrect: false }
  ],
  'Q-READ-049': [
    { code: 'A', text: 'technology', isCorrect: true },
    { code: 'B', text: 'alchemy', isCorrect: false },
    { code: 'C', text: 'astronomy', isCorrect: false },
    { code: 'D', text: 'mythology', isCorrect: false }
  ],
  'Q-READ-050': [
    { code: 'A', text: 'sustainability', isCorrect: true },
    { code: 'B', text: 'stagnation', isCorrect: false },
    { code: 'C', text: 'exhaustion', isCorrect: false },
    { code: 'D', text: 'inflation', isCorrect: false }
  ]
};

async function main() {
  console.log('================================================================');
  console.log(` DATABASE OPTION RESEEDING REPORT (${isApply ? 'APPLY MODE (IN-PLACE UPDATE)' : 'DRY-RUN MODE'}) `);
  console.log('================================================================\n');

  const diffTable = [];
  const backupRows = [];

  for (const [code, newOpts] of Object.entries(CONTEXTUAL_OPTIONS_MAP)) {
    const qRes = await pool.query(`
      SELECT q.id as question_id, qv.id as version_id
      FROM questions q
      JOIN question_versions qv ON qv.question_id = q.id
      WHERE q.code = $1 AND q.deleted_at IS NULL
    `, [code]);

    if (qRes.rows.length === 0) continue;
    const versionId = qRes.rows[0].version_id;

    const curOptsRes = await pool.query(`
      SELECT id, question_version_id, option_code, option_text, is_correct, display_order
      FROM answer_options
      WHERE question_version_id = $1
      ORDER BY display_order ASC
    `, [versionId]);

    curOptsRes.rows.forEach(r => backupRows.push(r));

    const curOptA = curOptsRes.rows.find(o => o.option_code === 'A')?.option_text || 'N/A';
    const curCorrect = curOptsRes.rows.find(o => o.is_correct)?.option_code || 'N/A';

    const newOptA = newOpts.find(o => o.code === 'A')?.text || 'N/A';
    const newCorrect = newOpts.find(o => o.isCorrect)?.code || 'N/A';

    diffTable.push({
      Question: code,
      'Current Option A': curOptA,
      'New Option A': newOptA,
      'Current Correct Answer': curCorrect,
      'New Correct Answer': newCorrect
    });

    if (isApply) {
      // IN-PLACE UPDATE of existing rows by option_code to preserve row IDs & foreign keys
      for (const newOpt of newOpts) {
        const existingRow = curOptsRes.rows.find(o => o.option_code === newOpt.code);
        if (existingRow) {
          await pool.query(
            `UPDATE answer_options
             SET option_text = $1, is_correct = $2
             WHERE id = $3`,
            [newOpt.text, newOpt.isCorrect, existingRow.id]
          );
        } else {
          // If option count changed (e.g. 4 options reduced to 3 for True/False/Not Given)
          await pool.query(
            `INSERT INTO answer_options (id, question_version_id, option_code, option_text, is_correct, display_order)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
            [versionId, newOpt.code, newOpt.text, newOpt.isCorrect, newOpts.indexOf(newOpt) + 1]
          );
        }
      }

      // If existing options exceed new options (e.g. 4th option D removed for True/False/Not Given)
      const newOptionCodes = new Set(newOpts.map(o => o.code));
      for (const existingRow of curOptsRes.rows) {
        if (!newOptionCodes.has(existingRow.option_code)) {
          await pool.query('DELETE FROM answer_options WHERE id = $1', [existingRow.id]);
        }
      }
    }
  }

  console.table(diffTable);

  if (isApply) {
    // Write backup JSON file before finishing
    const backupDir = path.join(__dirname, '../docs/backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `answer_options_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupRows, null, 2));
    console.log(`\n💾 BACKUP SAVED: ${backupRows.length} original option rows backed up to ${path.relative(path.join(__dirname, '..'), backupPath)}`);
    console.log('✅ SUCCESS: 28 Reading question options updated IN-PLACE in PostgreSQL!');
  } else {
    console.log('\nℹ️ DRY-RUN COMPLETE: Zero database rows were modified.');
    console.log('To execute in-place updates with automatic row backup, run:');
    console.log('  node scripts/reseed-reading-options-dryrun.js --apply\n');
  }

  await pool.end();
}

main().catch(err => console.error(err));
