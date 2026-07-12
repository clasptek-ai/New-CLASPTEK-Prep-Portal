import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Architecture Fitness Tests', () => {
  const rootDir = path.resolve(__dirname, '../../..');

  test('Dependency Cruiser validation check', () => {
    try {
      const output = execSync(
        'npx dependency-cruiser --config dependency-cruiser.config.js --output-type json apps packages',
        { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      const report = JSON.parse(output);
      const errors = report.summary.violations.filter((v: any) => v.rule.severity === 'error');

      expect(errors.length).toBe(0);
    } catch (err: any) {
      if (err.stdout) {
        const report = JSON.parse(err.stdout);
        const errors = report.summary.violations.filter((v: any) => v.rule.severity === 'error');
        expect(errors).toEqual([]);
      } else {
        throw err;
      }
    }
  });

  test('Package Manifests checker', () => {
    const packagesDir = path.join(rootDir, 'packages');
    const appsDir = path.join(rootDir, 'apps');

    const checkManifests = (dirPath: string) => {
      const targets = fs.readdirSync(dirPath);
      for (const target of targets) {
        const fullPath = path.join(dirPath, target);
        if (fs.statSync(fullPath).isDirectory()) {
          const manifestPath = path.join(fullPath, 'package.manifest.md');
          expect(fs.existsSync(manifestPath)).toBe(true);
        }
      }
    };

    checkManifests(packagesDir);
    checkManifests(appsDir);
  });

  test('ADR registration checker for Domain packages', () => {
    const domainDir = path.join(rootDir, 'packages/domain');
    if (fs.existsSync(domainDir)) {
      const domains = fs.readdirSync(domainDir);
      const adrIndexContent = fs.readFileSync(
        path.join(rootDir, 'docs/architecture/ADR/index.md'),
        'utf8'
      );

      for (const domain of domains) {
        const fullPath = path.join(domainDir, domain);
        if (fs.statSync(fullPath).isDirectory()) {
          // Expect reference to domain to exist in ADR index file
          const regex = new RegExp(domain, 'i');
          expect(adrIndexContent).toMatch(regex);
        }
      }
    }
  });
});
