require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Testing signInWithPassword directly via Supabase JS client...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'audit.student.1786017074254@clasptek.org',
    password: 'Password123!',
  });

  if (error) {
    console.error('signInWithPassword error:', error.message);
  } else {
    console.log('signInWithPassword SUCCESS:');
    console.log(' - User ID:', data.user.id);
    console.log(' - Email confirmed at:', data.user.email_confirmed_at);
    console.log(' - Access Token present?:', !!data.session?.access_token);
  }
}

main().catch(console.error);
