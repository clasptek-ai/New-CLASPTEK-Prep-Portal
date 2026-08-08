const { Pool } = require('pg');
require('dotenv').config();

async function runIndependentCatalogAudit() {
  console.log('=================================================================');
  console.log('CLASPTEK PREP PORTAL — INDEPENDENT POSTGRESQL CATALOG AUDIT');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // PHASE 1 — Verify Foreign Keys Catalog Query
  console.log('--- PHASE 1: TARGET TABLES FOREIGN KEYS CATALOG AUDIT ---');
  const fkQuery = `
    SELECT
      c.conname AS constraint_name,
      c.conrelid::regclass AS table_name,
      c.confrelid::regclass AS referenced_table,
      pg_get_constraintdef(c.oid) AS definition,
      c.convalidated AS validated
    FROM pg_constraint c
    WHERE c.contype='f'
      AND c.conrelid::regclass::text IN (
        'profiles', 'public.profiles', 'users', 'public.users', 
        'assessment_attempts', 'public.assessment_attempts', 
        'assessment_results', 'public.assessment_results', 
        'assessment_attempt_answers', 'public.assessment_attempt_answers', 
        'security_profiles', 'public.security_profiles', 
        'identities', 'public.identities', 
        'audit_logs', 'public.audit_logs'
      )
    ORDER BY c.conrelid::regclass::text;
  `;
  const fkRes = await pool.query(fkQuery);
  console.log(JSON.stringify(fkRes.rows, null, 2));

  // PHASE 2 — Verify Indexes supporting FKs
  console.log('\n--- PHASE 2: TARGET TABLES FOREIGN KEY INDEXES CATALOG AUDIT ---');
  const indexQuery = `
    SELECT
      t.relname AS table_name,
      c.conname AS constraint_name,
      a.attname AS column_name,
      i.relname AS index_name
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    LEFT JOIN pg_index x ON x.indrelid = t.oid AND a.attnum = ANY(x.indkey)
    LEFT JOIN pg_class i ON i.oid = x.indexrelid
    WHERE c.contype = 'f' 
      AND t.relname IN (
        'profiles', 'users', 'assessment_attempts', 
        'assessment_results', 'assessment_attempt_answers', 
        'security_profiles', 'identities', 'audit_logs'
      )
    ORDER BY t.relname, c.conname;
  `;
  const idxRes = await pool.query(indexQuery);
  console.log(JSON.stringify(idxRes.rows, null, 2));

  // PHASE 7 — Referential Integrity Exact SQL Queries
  console.log('\n--- PHASE 7: REFERENTIAL INTEGRITY CATALOG & DATA CHECKS ---');

  const q1 = await pool.query(`
    SELECT COUNT(*) FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL;
  `);
  console.log(`Profiles without auth users       : ${q1.rows[0].count}`);

  const q2 = await pool.query(`
    SELECT COUNT(*) FROM public.users pu
    LEFT JOIN auth.users au ON au.id = pu.id WHERE au.id IS NULL;
  `);
  console.log(`Public users without auth users    : ${q2.rows[0].count}`);

  const q3 = await pool.query(`
    SELECT COUNT(*) FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id WHERE p.user_id IS NULL;
  `);
  console.log(`Auth users without profiles       : ${q3.rows[0].count}`);

  const q4 = await pool.query(`
    SELECT email, COUNT(*) FROM public.identities
    GROUP BY email HAVING COUNT(*) > 1;
  `);
  console.log(`Duplicate identities count        : ${q4.rows.length}`);

  const q5 = await pool.query(`
    SELECT COUNT(*) FROM public.assessment_attempts a
    LEFT JOIN auth.users u ON u.id = a.student_id WHERE u.id IS NULL;
  `);
  console.log(`Attempts without students          : ${q5.rows[0].count}`);

  const q6 = await pool.query(`
    SELECT COUNT(*) FROM public.assessment_results r
    LEFT JOIN public.assessment_attempts a ON a.id = r.attempt_id WHERE a.id IS NULL;
  `);
  console.log(`Results without attempts          : ${q6.rows[0].count}`);

  const q7 = await pool.query(`
    SELECT COUNT(*) FROM public.assessment_attempt_answers ans
    LEFT JOIN public.assessment_attempts a ON a.id = ans.attempt_id WHERE a.id IS NULL;
  `);
  console.log(`Answers without attempts          : ${q7.rows[0].count}`);

  const q8 = await pool.query(`
    SELECT COUNT(*) FROM public.security_profiles s
    LEFT JOIN auth.users u ON u.id = s.user_id WHERE u.id IS NULL;
  `);
  console.log(`Security profiles without users   : ${q8.rows[0].count}`);

  // PHASE 8 — Constraint Validation Catalog Query
  console.log('\n--- PHASE 8: CONSTRAINT VALIDATION CATALOG CHECK ---');
  const valQuery = `
    SELECT conname, conrelid::regclass AS table_name, convalidated
    FROM pg_constraint WHERE contype='f' AND conrelid::regnamespace::text IN ('public', 'auth');
  `;
  const valRes = await pool.query(valQuery);
  console.table(valRes.rows);

  await pool.end();
}

runIndependentCatalogAudit().catch((err) => console.error(err));
