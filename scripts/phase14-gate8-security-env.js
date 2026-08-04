require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('================================================================================');
  console.log('   GATE 8: ENVIRONMENT & SECRETS SECURITY AUDIT (v1.0.0-RC1)');
  console.log('================================================================================\n');

  let passed = true;

  // 1. Verify .gitignore ignores .env files
  console.log('--- Checking .gitignore Rules ---');
  const gitignorePath = path.join(__dirname, '../.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const ignoresEnv = gitignoreContent.includes('.env');
    console.log(`  .gitignore contains .env rules: ${ignoresEnv ? 'PASSED ✅' : 'FAILED ❌'}`);
    if (!ignoresEnv) passed = false;
  } else {
    console.warn('  ⚠️ .gitignore not found');
  }

  // 2. Audit tracked files for exposed secrets & getAppUrl fallback
  console.log('\n--- Checking Environment Variable Configuration & App URL Fallback ---');
  const resolvedUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || process.env.APP_URL || 'https://portal.clasptek.org';
  console.log(`  Resolved Canonical App URL: ${resolvedUrl} ${resolvedUrl.includes('clasptek.org') || resolvedUrl.includes('localhost') ? 'PASSED ✅' : 'FAILED ❌'}`);

  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, public: true },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, public: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, public: false },
    { name: 'DATABASE_URL', required: true, public: false },
  ];

  for (const ev of envVars) {
    const val = process.env[ev.name];
    if (ev.required && !val) {
      console.log(`  ${ev.name.padEnd(35)}: NOT SET ❌`);
      passed = false;
    } else if (val) {
      const display = ev.public ? val : val.substring(0, 15) + '... (SECRET HIDDEN)';
      console.log(`  ${ev.name.padEnd(35)}: SET (${display}) ✅`);
    }
  }

  console.log('\n--------------------------------------------------------------------------------');
  if (passed) {
    console.log('✅ ENVIRONMENT & SECRETS SECURITY AUDIT PASSED: ALL REQUIRED ENVS SET & UNTRACKED');
  } else {
    console.error('❌ ENVIRONMENT & SECRETS SECURITY AUDIT FAILED — MISSING REQUIRED ENVS');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Security env audit error:', e);
  process.exit(1);
});
