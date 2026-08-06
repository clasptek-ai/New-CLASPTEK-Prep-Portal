const fs = require('fs');
const path = require('path');

const planData = JSON.parse(
  fs.readFileSync(
    'C:/Users/CLASPTEK/.gemini/antigravity-ide/brain/c4f9b5a6-1012-4d4b-8550-d552103be746/user_6_commit_plan.json',
    'utf8'
  )
);

const manifestDir = path.join(__dirname, '../.release-manifests/v1.1');
if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

const manifests = [
  { name: 'commit-1-build.txt', files: planData.commit1 },
  { name: 'commit-2-api.txt', files: planData.commit2 },
  { name: 'commit-3-ui.txt', files: planData.commit3 },
  { name: 'commit-4-test.txt', files: planData.commit4 },
  { name: 'commit-5-docs.txt', files: planData.commit5 },
  { name: 'commit-6-formatting.txt', files: planData.commit6 },
];

manifests.forEach((m) => {
  const filePath = path.join(manifestDir, m.name);
  const cleanFiles = m.files.map((f) => f.replace(/^\uFEFF/, '').trim());
  fs.writeFileSync(filePath, cleanFiles.join('\n') + '\n', 'utf8');
  console.log(`Created manifest ${m.name} (${cleanFiles.length} files)`);
});

console.log(`\nSuccessfully created all 6 clean UTF-8 release manifest files in ${manifestDir}`);
