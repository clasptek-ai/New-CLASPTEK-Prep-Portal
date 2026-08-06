const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestDir = path.join(root, '.release/v1.1/manifests');

const manifests = [
  { name: 'commit-1-build.txt', title: 'Commit 1: Build / pnpm / CI' },
  { name: 'commit-2-api.txt', title: 'Commit 2: Next.js 15 API Compatibility & Route Updates' },
  { name: 'commit-3-ui.txt', title: 'Commit 3: UI / Navigation / Authentication Updates' },
  { name: 'commit-4-test.txt', title: 'Commit 4: Test & Operational Verification Scripts' },
  { name: 'commit-5-docs.txt', title: 'Commit 5: Documentation' },
  { name: 'commit-6-formatting.txt', title: 'Commit 6: Formatting' },
];

const report = {
  manifests: [],
  globalDuplicates: [],
  globalMissing: [],
  totalFiles: 0,
  uniqueFiles: 0,
  passed: true,
};

const seenFiles = new Map();

manifests.forEach((m) => {
  const filePath = path.join(manifestDir, m.name);
  if (!fs.existsSync(filePath)) {
    report.passed = false;
    report.globalMissing.push(m.name);
    return;
  }

  const lines = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const fileCount = lines.length;
  const missingInManifest = [];
  const intraDuplicates = [];
  const seenInManifest = new Set();

  lines.forEach((relPath) => {
    report.totalFiles++;

    // 1. Physical Existence Check
    const absPath = path.join(root, relPath);
    if (!fs.existsSync(absPath)) {
      missingInManifest.push(relPath);
      report.passed = false;
    }

    // 2. Intra-manifest duplicate check
    if (seenInManifest.has(relPath)) {
      intraDuplicates.push(relPath);
      report.passed = false;
    } else {
      seenInManifest.add(relPath);
    }

    // 3. Inter-manifest overlap check
    if (seenFiles.has(relPath)) {
      const prevCommit = seenFiles.get(relPath);
      report.globalDuplicates.push({ file: relPath, commitA: prevCommit, commitB: m.name });
      report.passed = false;
    } else {
      seenFiles.set(relPath, m.name);
    }
  });

  report.manifests.push({
    name: m.name,
    title: m.title,
    count: fileCount,
    missing: missingInManifest,
    intraDuplicates: intraDuplicates,
    valid: missingInManifest.length === 0 && intraDuplicates.length === 0,
  });
});

report.uniqueFiles = seenFiles.size;

console.log(JSON.stringify(report, null, 2));
