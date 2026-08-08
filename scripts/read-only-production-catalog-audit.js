const { Pool } = require('pg');
require('dotenv').config();

async function runReadOnlyCatalogAudit() {
  console.log('=================================================================');
  console.log('CLASPTEK PREP PORTAL — READ-ONLY PRODUCTION CATALOG AUDIT');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // PHASE 1 — Complete FK Inventory across 9 target tables
  console.log('--- PHASE 1: DETAILED FK INVENTORY ---');
  const fkQuery = `
    SELECT
      c.conname AS constraint_name,
      c.conrelid::regclass AS source_table,
      a.attname AS source_column,
      c.confrelid::regclass AS referenced_table,
      af.attname AS referenced_column,
      CASE c.confdeltype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
      END AS on_delete_action,
      CASE c.confupdtype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
      END AS on_update_action,
      c.convalidated AS validated
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
    WHERE c.contype = 'f'
      AND c.conrelid::regclass::text IN (
        'profiles', 'public.profiles', 'users', 'public.users', 
        'assessment_attempts', 'public.assessment_attempts', 
        'assessment_results', 'public.assessment_results', 
        'assessment_attempt_answers', 'public.assessment_attempt_answers', 
        'security_profiles', 'public.security_profiles', 
        'identities', 'public.identities', 
        'audit_logs', 'public.audit_logs'
      )
    ORDER BY c.conrelid::regclass::text, c.conname;
  `;
  const fkRes = await pool.query(fkQuery);
  console.log(JSON.stringify(fkRes.rows, null, 2));

  // PHASE 2 — Duplicate Constraint Investigation
  console.log('\n--- PHASE 2: DUPLICATE CONSTRAINT INVESTIGATION ---');
  const dupQuery = `
    SELECT
      c.conname AS constraint_name,
      c.conrelid::regclass AS source_table,
      a.attname AS source_column,
      c.confrelid::regclass AS referenced_table,
      af.attname AS referenced_column,
      CASE c.confdeltype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
      END AS on_delete_action
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
    WHERE c.contype = 'f'
      AND c.conrelid::regclass::text IN ('profiles', 'public.profiles', 'assessment_results', 'public.assessment_results')
    ORDER BY c.conrelid::regclass::text, a.attname;
  `;
  const dupRes = await pool.query(dupQuery);
  console.log(JSON.stringify(dupRes.rows, null, 2));

  // PHASE 4 — Index Audit
  console.log('\n--- PHASE 4: INDEX AUDIT FOR FK COLUMNS ---');
  const idxQuery = `
    SELECT
      t.relname AS table_name,
      c.conname AS constraint_name,
      a.attname AS column_name,
      i.relname AS index_name,
      ix.indisunique AS is_unique
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    LEFT JOIN pg_index ix ON ix.indrelid = t.oid AND a.attnum = ANY(ix.indkey)
    LEFT JOIN pg_class i ON i.oid = ix.indexrelid
    WHERE c.contype = 'f'
      AND t.relname IN (
        'profiles', 'users', 'assessment_attempts', 
        'assessment_results', 'assessment_attempt_answers', 
        'security_profiles', 'identities', 'audit_logs'
      )
    ORDER BY t.relname, c.conname;
  `;
  const idxRes = await pool.query(idxQuery);
  console.log(JSON.stringify(idxRes.rows, null, 2));

  // PHASE 7 & PHASE 8 — Constraint Validation & Exact SQL Integrity Checks
  console.log('\n--- PHASE 7 & 8: INTEGRITY CHECKS ---');
  const q1 = await pool.query(
    `SELECT COUNT(*) FROM public.profiles p LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL;`
  );
  const q2 = await pool.query(
    `SELECT COUNT(*) FROM public.users pu LEFT JOIN auth.users au ON au.id = pu.id WHERE au.id IS NULL;`
  );
  const q3 = await pool.query(
    `SELECT COUNT(*) FROM public.assessment_attempts a LEFT JOIN auth.users u ON u.id = a.student_id WHERE u.id IS NULL;`
  );
  const q4 = await pool.query(
    `SELECT COUNT(*) FROM public.assessment_results r LEFT JOIN public.assessment_attempts a ON a.id = r.attempt_id WHERE a.id IS NULL;`
  );
  const q5 = await pool.query(
    `SELECT COUNT(*) FROM public.assessment_attempt_answers ans LEFT JOIN public.assessment_attempts a ON a.id = ans.attempt_id WHERE a.id IS NULL;`
  );
  const q6 = await pool.query(
    `SELECT COUNT(*) FROM public.security_profiles s LEFT JOIN auth.users u ON u.id = s.user_id WHERE u.id IS NULL;`
  );
  const q7 = await pool.query(
    `SELECT email, COUNT(*) FROM public.identities GROUP BY email HAVING COUNT(*) > 1;`
  );

  console.log(`Profiles without auth users       : ${q1.rows[0].count}`);
  console.log(`Public users without auth users    : ${q2.rows[0].count}`);
  console.log(`Attempts without students          : ${q3.rows[0].count}`);
  console.log(`Results without attempts          : ${q4.rows[0].count}`);
  console.log(`Answers without attempts          : ${q5.rows[0].count}`);
  console.log(`Security profiles without users   : ${q6.rows[0].count}`);
  console.log(`Duplicate identities count        : ${q7.rows.length}`);

  await pool.end();
}

runReadOnlyCatalogAudit().catch((err) => console.error(err));
