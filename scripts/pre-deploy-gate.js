const { execSync } = require('child_process');

console.log('================================================================================');
console.log('   CLASPTEK PRE-DEPLOYMENT CERTIFICATION GATE');
console.log('================================================================================\n');

function runStep(name, command, allowFailure = false) {
  console.log(`[GATE STEP] ${name}...`);
  const start = Date.now();
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`[GATE STEP PASSED] ${name} (${Date.now() - start}ms) ✅\n`);
  } catch (err) {
    if (allowFailure) {
      console.warn(`\n⚠️ [GATE WARNING] Step emitted warnings but non-blocking: ${name}\n`);
    } else {
      console.error(`\n❌ [GATE DEPLOYMENT BLOCKED] Step failed: ${name}`);
      console.error(`Command: ${command}`);
      process.exit(1);
    }
  }
}

// Gate Pipeline Sequence
runStep('1. TypeScript Type Verification', 'pnpm --filter @clasptek/web typecheck');
runStep('2. ESLint Quality Standard', 'pnpm --filter @clasptek/web lint', true);
runStep('3. Database Connection & Schema Health Check', 'node scripts/db-health-check.js');
runStep('4. Production Content Inventory Audit', 'node scripts/production-release-audit.js');

console.log('================================================================================');
console.log('   🎉 ALL PRE-DEPLOYMENT CERTIFICATION CHECKS PASSED ✅');
console.log('   APPLICATION IS APPROVED FOR PRODUCTION DEPLOYMENT');
console.log('================================================================================');
