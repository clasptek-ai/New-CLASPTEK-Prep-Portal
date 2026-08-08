const { Pool } = require('pg');
require('dotenv').config();

async function checkStudentDb() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  const res = await pool.query(
    `SELECT u.id, u.email, u.raw_user_meta_data, p.first_name, p.last_name
     FROM auth.users u
     LEFT JOIN public.profiles p ON u.id = p.user_id
     WHERE u.email = 'ayomideshittu2008@gmail.com'`
  );

  console.log('Database Identity Audit for ayomideshittu2008@gmail.com:');
  console.log(JSON.stringify(res.rows, null, 2));

  await pool.end();
}

checkStudentDb().catch((err) => console.error(err));
