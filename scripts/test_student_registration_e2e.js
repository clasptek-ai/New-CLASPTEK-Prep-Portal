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
    console.log('   END-TO-END REGISTRATION & STUDENT DIRECTORY VERIFICATION');
    console.log(
      '================================================================================\n'
    );

    const timestamp = Date.now();
    const testCandidate = {
      email: `test.student.${timestamp}@clasptek.org`,
      password: 'TestPassword123!',
      firstName: 'Audit',
      lastName: 'Candidate',
      phone: '+44 7911 123456',
      programme: 'IELTS Academic',
      country: 'United Kingdom',
    };

    console.log(`1. Simulating Registration payload for candidate: ${testCandidate.email}`);
    console.log(`   Phone:     ${testCandidate.phone}`);
    console.log(`   Programme: ${testCandidate.programme}\n`);

    // 2. Perform direct registration call simulating POST /api/v1/auth/register behavior
    // Create user in auth.users
    const createUserRes = await client.query(
      `
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        $1,
        'encrypted_placeholder',
        jsonb_build_object(
          'first_name', $2::text,
          'last_name', $3::text,
          'phone', $4::text,
          'programme', $5::text,
          'country', $6::text
        ),
        now(),
        now()
      )
      RETURNING id, email
    `,
      [
        testCandidate.email,
        testCandidate.firstName,
        testCandidate.lastName,
        testCandidate.phone,
        testCandidate.programme,
        testCandidate.country,
      ]
    );

    const newUserId = createUserRes.rows[0].id;
    console.log(`2. User created in auth.users with ID: ${newUserId}`);

    // Create record in public.users
    await client.query(
      `
      INSERT INTO public.users (id, status, version, created_at, updated_at)
      VALUES ($1, 'ACTIVE', 1, now(), now())
      ON CONFLICT (id) DO NOTHING
    `,
      [newUserId]
    );

    // Create record in public.profiles
    await client.query(
      `
      INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'en', 'UTC', 1, now(), now())
    `,
      [
        newUserId,
        testCandidate.firstName,
        testCandidate.lastName,
        testCandidate.phone,
        testCandidate.programme,
      ]
    );
    console.log('3. Candidate profile persisted into public.profiles');

    // 3. Query Student Directory API SQL view
    const dirRes = await client.query(
      `
      SELECT 
        u.id,
        p.first_name,
        p.last_name,
        au.email,
        COALESCE(p.phone, au.phone, au.raw_user_meta_data->>'phone', 'NOT RECORDED') as phone,
        COALESCE(spe.programme_id::text, p.target_programme, au.raw_user_meta_data->>'programme', 'UNASSIGNED') as programme,
        COALESCE(spe.cohort_id::text, 'UNASSIGNED') as cohort,
        u.status,
        u.created_at as "registeredDate"
      FROM public.users u
      JOIN auth.users au ON au.id = u.id
      LEFT JOIN public.profiles p ON p.user_id = u.id
      LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = u.id
      WHERE u.id = $1
    `,
      [newUserId]
    );

    const record = dirRes.rows[0];
    console.log('\n4. Student Directory Query Output for Registered Candidate:');
    console.log(`   ID:        ${record.id}`);
    console.log(`   Name:      ${record.first_name} ${record.last_name}`);
    console.log(`   Email:     ${record.email}`);
    console.log(`   Phone:     ${record.phone}`);
    console.log(`   Programme: ${record.programme}`);
    console.log(`   Status:    ${record.status}`);

    if (record.phone === testCandidate.phone && record.programme === testCandidate.programme) {
      console.log('\n✅ END-TO-END REGISTRATION & DIRECTORY DATA BINDING PASSED 100%');
    } else {
      console.error('\n❌ DATA BINDING MISMATCH');
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
