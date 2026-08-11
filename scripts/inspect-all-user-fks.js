const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const dbUrl = (process.env.DATABASE_URL || '').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  );
  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const res = await pool.query(`
    SELECT
      tc.table_schema, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule,
      rc.update_rule,
      tc.constraint_name
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE ccu.table_name IN ('users', 'profiles', 'identities', 'candidates')
       OR tc.table_name IN ('users', 'profiles', 'identities', 'security_profiles', 'user_roles', 'student_programme_enrollments', 'assessment_attempts', 'assessment_results')
    ORDER BY tc.table_name, tc.constraint_name;
  `);

  console.table(res.rows);
  await pool.end();
}

main().catch(console.error);
