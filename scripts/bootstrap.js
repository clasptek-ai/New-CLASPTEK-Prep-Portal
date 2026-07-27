const { execSync } = require('child_process');
const _fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('=========================================');
console.log('Clasptek V2 Monorepo Developer Bootstrap');
console.log('=========================================');

function runCommand(command, desc) {
  console.log(`\n> Running: ${desc}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`Error executing ${desc}:`, err.message);
    process.exit(1);
  }
}

// 1. Install dependencies
runCommand('pnpm install', 'Installing dependencies via pnpm');

// 2. Setup Git Hooks
runCommand('npx simple-git-hooks', 'Registering Git hooks');

// 3. Run initial project build
runCommand('pnpm run build', 'Performing initial build to seed TS project references');

console.log('\n=========================================');
console.log('Bootstrap complete. Developer platform ready!');
console.log('=========================================');
