import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '..');
const reportsDir = path.join(rootDir, 'reports/architecture');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function runCruiser() {
  try {
    const raw = execSync(
      'npx dependency-cruiser --config dependency-cruiser.config.js --output-type json apps packages',
      { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    return JSON.parse(raw);
  } catch (err: any) {
    if (err.stdout) {
      return JSON.parse(err.stdout);
    }
    throw err;
  }
}

function main() {
  console.log('Generating Architecture Fitness Report...');
  const data = runCruiser();
  const violations = data.summary.violations || [];

  const circulars = violations.filter((v: any) => v.rule.name === 'no-circular').length;
  const dddViolations = violations.filter((v: any) => v.rule.name.includes('constraints')).length;
  const crossDomain = violations.filter((v: any) => v.rule.name.includes('cross-domain')).length;
  const serverLeakage = violations.filter(
    (v: any) =>
      v.rule.name.includes('domain-layer-boundaries') ||
      v.rule.name.includes('application-layer-boundaries')
  ).length;
  const unauthorized =
    violations.filter((v: any) => v.rule.name.includes('boundaries')).length - serverLeakage;

  const totalViolations = violations.length;
  const score = Math.max(0, 100 - totalViolations * 10);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture Fitness Dashboard</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, sans-serif;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #232e48;
      padding-bottom: 1rem;
    }
    .title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #14b8a6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .score-box {
      background: #151d30;
      border: 1px solid #232e48;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      margin-top: 2rem;
    }
    .score-val {
      font-size: 4rem;
      font-weight: 800;
      color: ${score === 100 ? '#10b981' : score >= 80 ? '#3b82f6' : '#ef4444'};
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .card {
      background: #151d30;
      border: 1px solid #232e48;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    .card h3 {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .card .val {
      font-size: 2rem;
      font-weight: 700;
      margin-top: 0.5rem;
      color: #f8fafc;
    }
    .card.error .val {
      color: #ef4444;
    }
    .card.success .val {
      color: #10b981;
    }
    .violations-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 3rem;
    }
    .violations-table th, .violations-table td {
      padding: 1rem;
      border-bottom: 1px solid #232e48;
      text-align: left;
    }
    .violations-table th {
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">Clasptek Prep Portal V2</div>
      <div style="color: #94a3b8;">Fitness Report • Staging Pipeline</div>
    </div>
    
    <div class="score-box">
      <div style="font-size: 1.2rem; color: #94a3b8;">Architecture Fitness Score</div>
      <div class="score-val">${score}%</div>
      <div style="margin-top: 0.5rem; color: #94a3b8;">
        ${score === 100 ? 'Clean architecture. Zero violations.' : 'Action required to restore architecture integrity.'}
      </div>
    </div>

    <div class="grid">
      <div class="card ${dddViolations > 0 ? 'error' : 'success'}">
        <h3>DDD Violations</h3>
        <div class="val">${dddViolations}</div>
      </div>
      <div class="card ${circulars > 0 ? 'error' : 'success'}">
        <h3>Circular Deps</h3>
        <div class="val">${circulars}</div>
      </div>
      <div class="card ${crossDomain > 0 ? 'error' : 'success'}">
        <h3>Cross Domain</h3>
        <div class="val">${crossDomain}</div>
      </div>
      <div class="card ${serverLeakage > 0 ? 'error' : 'success'}">
        <h3>Server Leakage</h3>
        <div class="val">${serverLeakage}</div>
      </div>
      <div class="card ${unauthorized > 0 ? 'error' : 'success'}">
        <h3>Unauthorized Deps</h3>
        <div class="val">${unauthorized}</div>
      </div>
    </div>

    ${
      violations.length > 0
        ? `
    <h2 style="margin-top: 3rem;">Violations Ledger</h2>
    <table class="violations-table">
      <thead>
        <tr>
          <th>Rule</th>
          <th>Severity</th>
          <th>From</th>
          <th>To</th>
        </tr>
      </thead>
      <tbody>
        ${violations
          .map(
            (v: any) => `
        <tr>
          <td><strong>${v.rule.name}</strong></td>
          <td style="color: #ef4444;">${v.rule.severity.toUpperCase()}</td>
          <td>${v.from}</td>
          <td>${v.to}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, 'fitness-report.html'), html, 'utf8');
  console.log('Fitness report saved to reports/architecture/fitness-report.html');
}

main();
