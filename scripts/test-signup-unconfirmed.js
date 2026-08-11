const { loadEnvironment } = require('@clasptek/configuration');
const { createSupabaseAdminClient, DatabasePool } = require('@clasptek/persistence');
const { ConsoleLogger } = require('@clasptek/observability');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function testUnconfirmedCreateUser() {
  console.log('--- TESTING createUser with email_confirm: false ---');

  const config = loadEnvironment(process.env);
  const testEmail = `unconfirmed.${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  const supabaseAdmin = createSupabaseAdminClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: false, // User is created as UNCONFIRMED, requires email verification!
    user_metadata: {
      first_name: 'Unconfirmed',
      last_name: 'Candidate',
    },
  });

  if (createErr) {
    console.error('❌ Error creating user:', createErr);
    return;
  }

  const userId = authData.user.id;
  console.log('✅ createUser SUCCESS. userId:', userId);
  console.log('User email_confirmed_at:', authData.user.email_confirmed_at); // should be undefined/null!

  const dbLogger = new ConsoleLogger('UnconfirmedTest');
  const dbPool = new DatabasePool(config, dbLogger);
  await dbPool.connect();
  const pool = dbPool.getPool();

  const authUserCheck = await pool.query(
    'SELECT id, email, confirmed_at, created_at FROM auth.users WHERE id = $1',
    [userId]
  );
  console.log('auth.users row in PostgreSQL:', authUserCheck.rows[0]);

  await dbPool.disconnect();
}

testUnconfirmedCreateUser().catch((err) => console.error(err));
