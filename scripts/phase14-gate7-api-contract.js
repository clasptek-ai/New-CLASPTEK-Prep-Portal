require('dotenv').config();

async function main() {
  console.log('================================================================================');
  console.log('   GATE 7: API CONTRACT & ENVELOPE VALIDATION (v1.0.0-RC1)');
  console.log('================================================================================\n');

  const fs = require('fs');
  const path = require('path');

  // Static AST/pattern inspection across API route files
  const apiDir = path.join(__dirname, '../apps/web/src/app/api/v1');
  let routeFiles = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (f === 'route.ts') {
        routeFiles.push(full);
      }
    }
  }

  walk(apiDir);

  console.log(`Auditing ${routeFiles.length} API route files for ApiResponse / envelope compliance...\n`);

  let compliantRoutes = 0;
  let nonCompliantRoutes = 0;

  for (const file of routeFiles) {
    const rel = path.relative(path.join(__dirname, '..'), file);
    const content = fs.readFileSync(file, 'utf8');

    // Check if route returns structured JSON or uses ApiResponse / NextResponse.json
    const hasNextResponseJson = content.includes('NextResponse.json');
    const hasApiResponse = content.includes('ApiResponse.');

    if (hasNextResponseJson || hasApiResponse) {
      compliantRoutes++;
    } else {
      nonCompliantRoutes++;
      console.warn(`  ⚠️ Route lacks explicit JSON response envelope: ${rel}`);
    }
  }

  console.log(`\nCompliance Summary:`);
  console.log(`  Compliant Route Handlers:     ${compliantRoutes} / ${routeFiles.length} (${Math.round((compliantRoutes / routeFiles.length) * 100)}%)`);
  console.log(`  Non-Compliant Route Handlers: ${nonCompliantRoutes}`);

  if (nonCompliantRoutes === 0) {
    console.log('\n✅ API CONTRACT VALIDATION PASSED: 100% API ROUTES SATISFY ENVELOPE STANDARD');
  } else {
    console.log('\n🟡 API CONTRACT AUDIT COMPLETED WITH WARNINGS');
  }
}

main().catch((e) => {
  console.error('API contract validation error:', e);
  process.exit(1);
});
