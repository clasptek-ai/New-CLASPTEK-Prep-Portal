require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runForensicAudit() {
  console.log('================================================================');
  console.log('    SUPABASE AUTH & EMAIL CONFIRMATION FORENSIC AUDIT           ');
  console.log('================================================================\n');

  // 1. Audit recent users in auth.users
  const userCheck = await pool.query(`
    SELECT id, email, email_confirmed_at, confirmation_sent_at, recovery_sent_at,
           created_at, updated_at, raw_app_meta_data, raw_user_meta_data
    FROM auth.users
    ORDER BY created_at DESC LIMIT 10
  `);

  console.log(`Found ${userCheck.rows.length} recent auth.users records:`);
  console.table(
    userCheck.rows.map((r) => ({
      id: r.id,
      email: r.email,
      confirmed: r.email_confirmed_at ? 'YES' : 'NO (NOT CONFIRMED)',
      confirmed_at: r.email_confirmed_at,
      confirmation_sent_at: r.confirmation_sent_at,
      recovery_sent_at: r.recovery_sent_at,
      created_at: r.created_at,
    }))
  );

  // 2. Audit admin user management API link generation behavior
  if (userCheck.rows.length > 0) {
    const testUser = userCheck.rows[0];
    console.log(`\nTesting Admin Link Generation for user: ${testUser.email}...`);

    try {
      const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: testUser.email,
        options: { redirectTo: 'http://localhost:3000/auth/callback?next=/student/welcome' },
      });

      if (inviteErr) {
        console.error('generateLink (magiclink) error:', inviteErr.message);
      } else {
        console.log('Generated MagicLink Action Link properties:');
        console.log(' - hashed_token:', inviteData.properties?.hashed_token);
        console.log(' - action_link:', inviteData.properties?.action_link);
        console.log(' - redirect_to:', inviteData.properties?.redirect_to);
      }

      const { data: recoveryData, error: recoveryErr } =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: testUser.email,
          options: { redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password' },
        });

      if (recoveryErr) {
        console.error('generateLink (recovery) error:', recoveryErr.message);
      } else {
        console.log('\nGenerated Recovery Action Link properties:');
        console.log(' - hashed_token:', recoveryData.properties?.hashed_token);
        console.log(' - action_link:', recoveryData.properties?.action_link);
        console.log(' - redirect_to:', recoveryData.properties?.redirect_to);
      }
    } catch (e) {
      console.error('Link generation exception:', e);
    }
  }

  await pool.end();
}

runForensicAudit().catch((err) => {
  console.error('Forensic Audit Error:', err);
  process.exit(1);
});
