const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const v11Dir = path.join(root, '.release/v1.1');
const manifestsDir = path.join(v11Dir, 'manifests');
const logsDir = path.join(v11Dir, 'logs');
const reportsDir = path.join(v11Dir, 'reports');
const artifactsDir = path.join(v11Dir, 'artifacts');

[v11Dir, manifestsDir, logsDir, reportsDir, artifactsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const oldManifestDir = path.join(root, '.release-manifests/v1.1');
if (fs.existsSync(oldManifestDir)) {
  const files = fs.readdirSync(oldManifestDir);
  files.forEach((f) => {
    fs.copyFileSync(path.join(oldManifestDir, f), path.join(manifestsDir, f));
    console.log(`Copied ${f} -> .release/v1.1/manifests/${f}`);
  });
}

console.log(`\nSuccessfully created enterprise release directory structure at .release/v1.1/`);
