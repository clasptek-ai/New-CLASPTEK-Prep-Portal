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
          const regex = new RegExp(domain, 'i');
          expect(adrIndexContent).toMatch(regex);
        }
      }
    }
  });

  test('Client Bundle Leakage check for Server configs/adapters', () => {
    const webSrcDir = path.join(rootDir, 'apps/web/src');

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // If the file is explicitly designated as browser-facing client component
          if (content.includes('"use client"') || content.includes("'use client'")) {
            // Verify it does not import server-only parameters
            const hasServerConfigImport = content.includes('@clasptek/configuration');
            const hasPersistenceImport = content.includes('@clasptek/persistence');

            if (hasServerConfigImport || hasPersistenceImport) {
              throw new Error(
                `Client bundle leakage detected in "${fullPath}". Client component must not import server configuration or persistence adapters.`
              );
            }
          }
        }
      }
    };

    if (fs.existsSync(webSrcDir)) {
      scanDir(webSrcDir);
    }
  });
});
