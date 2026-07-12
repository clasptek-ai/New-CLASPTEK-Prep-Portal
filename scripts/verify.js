const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('=========================================');
console.log('Clasptek V2 Monorepo Platform Verification');
console.log('=========================================');

function runCommand(command, desc) {
  console.log(`\n> Running: ${desc}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ Verification Failed at: ${desc}`);
    process.exit(1);
  }
}

// 1. Lint checks
runCommand('pnpm run lint', 'ESLint analysis check');

// 2. Format checks
runCommand('pnpm run format:check', 'Prettier styling checks');

// 3. Type safety checks
runCommand('pnpm run typecheck', 'TypeScript compiler checks');

// 4. Run Vitest suites
runCommand('pnpm run test', 'Executing Vitest testing suite');

// 5. Build caches check
runCommand('pnpm run build', 'Turborepo build pipeline test');

// 6. Generate architecture fitness report
runCommand('pnpm run report:fitness', 'Exporting Architecture Fitness Dashboard');

console.log('\n=========================================');
console.log('✅ Verification complete. All Quality Gates PASS!');
console.log('=========================================');
