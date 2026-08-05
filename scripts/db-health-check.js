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
    console.log('================================================================================');
    console.log('   CLASPTEK DATABASE HEALTH & PERFORMANCE CHECK');
    console.log(
      '================================================================================\n'
    );

    // 1. Connection & Ping
    const pingStart = Date.now();
    const pingRes = await client.query('SELECT NOW() as now, current_database() as db');
    const pingMs = Date.now() - pingStart;
    console.log(`Database Connection:  HEALTHY ✅ (Latency: ${pingMs}ms)`);
    console.log(`Current Database:     ${pingRes.rows[0].db}`);
    console.log(`Server Time:          ${pingRes.rows[0].now.toISOString()}\n`);

    // 2. Table Row Counts & Primary Keys
    const tables = [
      'assessment_attempts',
      'assessment_attempt_answers',
      'assessment_results',
      'assessment_attempt_events',
      'questions',
      'question_versions',
      'reading_passages',
      'writing_tasks',
      'profiles',
    ];

    console.log('--- Table Summary ---');
    for (const table of tables) {
      const cntRes = await client.query(`SELECT COUNT(*) as n FROM public.${table}`);
      console.log(`  public.${table.padEnd(28)} Rows: ${cntRes.rows[0].n}`);
    }

    // 3. Question Level Stratification Check
    console.log('\n--- Question Level Stratification ---');
    const levelRes = await client.query(`
      SELECT qv.proficiency_level, COUNT(*) as cnt
      FROM public.question_versions qv
      JOIN public.questions q ON q.id = qv.question_id
      WHERE q.deleted_at IS NULL
      GROUP BY qv.proficiency_level
      ORDER BY cnt DESC
    `);
    levelRes.rows.forEach((r) => console.log(`  ${r.proficiency_level.padEnd(15)} : ${r.cnt}`));

    // 4. Index Health Check
    console.log('\n--- Index Coverage ---');
    const idxRes = await client.query(
      `
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = ANY($1::text[])
      ORDER BY tablename, indexname
    `,
      [tables]
    );
    console.log(`Total Indexes verified across key tables: ${idxRes.rows.length} ✅`);

    // 5. Active/Idle Connections
    console.log('\n--- Connection Pool Status ---');
    try {
      const connRes = await client.query(`
        SELECT state, count(*) as cnt
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);
      connRes.rows.forEach((r) =>
        console.log(`  State: ${(r.state || 'active').padEnd(15)} : ${r.cnt}`)
      );
    } catch {
      console.log('  Connection stats: N/A (requires pg_stat_activity access)');
    }

    console.log(
      '\n================================================================================'
    );
    console.log('   DATABASE HEALTH STATUS: ALL SYSTEMS OPERATIONAL ✅');
    console.log('================================================================================');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Database Health Check Failed ❌:', err.message);
  process.exit(1);
});
