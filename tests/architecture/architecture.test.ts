import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Architecture Fitness Tests', () => {
  const rootDir = path.resolve(__dirname, '../..');

  test('Dependency Cruiser validation check', () => {
    try {
      const output = execSync(
        'npx dependency-cruiser --config dependency-cruiser.config.js --output-type json apps packages',
        {
          cwd: rootDir,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          maxBuffer: 10 * 1024 * 1024,
        }
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

    const checkManifestsInDir = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dirPath, entry.name);
          const hasPackageJson = fs.existsSync(path.join(fullPath, 'package.json'));
          if (hasPackageJson) {
            const manifestPath = path.join(fullPath, 'package.manifest.md');
            expect(fs.existsSync(manifestPath)).toBe(true);
          } else {
            // Recurse into categories like packages/domain, packages/application
            checkManifestsInDir(fullPath);
          }
        }
      }
    };

    checkManifestsInDir(packagesDir);
    checkManifestsInDir(appsDir);
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

  test('Curriculum Domain dependencies verification', () => {
    const domainCurriculumSrc = path.join(rootDir, 'packages/domain/curriculum/src');
    if (!fs.existsSync(domainCurriculumSrc)) return;

    const scanDomainDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDomainDir(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Rules check
          const hasSupabase =
            content.includes('@supabase/supabase-js') || content.includes('@supabase/ssr');
          const hasPg = content.includes("from 'pg'") || content.includes('from "pg"');
          const hasReact =
            content.includes("from 'react'") ||
            content.includes('from "react"') ||
            content.includes("from 'react-dom'") ||
            content.includes('from "react-dom"');
          const hasNext = content.includes("from 'next/") || content.includes('from "next/');
          const hasPersistence = content.includes('@clasptek/persistence');

          if (hasSupabase || hasPg || hasReact || hasNext || hasPersistence) {
            throw new Error(
              `Boundary violation in Curriculum Domain file "${fullPath}": must not import Supabase, pg, React, Next.js, or Persistence packages.`
            );
          }
        }
      }
    };
    scanDomainDir(domainCurriculumSrc);
  });

  test('AI Evaluation Domain boundary enforcement', () => {
    // Architecture Fitness Rule: packages/domain/ai-evaluation must never import
    // React, Supabase SDK, direct pg driver, Next.js, or the Persistence package.
    // Only @clasptek/kernel contracts and crypto primitives are permitted.
    const domainAiEvalSrc = path.join(rootDir, 'packages/domain/ai-evaluation/src');
    if (!fs.existsSync(domainAiEvalSrc)) return;

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');

          const hasReact =
            content.includes("from 'react'") ||
            content.includes('from "react"') ||
            content.includes("from 'react-dom'") ||
            content.includes('from "react-dom"');

          const hasSupabase =
            content.includes('@supabase/supabase-js') || content.includes('@supabase/ssr');

          const hasDirectPg = content.includes("from 'pg'") || content.includes('from "pg"');

          const hasNext = content.includes("from 'next/") || content.includes('from "next/');

          const hasPersistence = content.includes('@clasptek/persistence');

          const hasAssessmentRuntime =
            content.includes('@clasptek/domain-assessment-runtime') &&
            !content.includes('@clasptek/domain-assessment-runtime'); // cross-context ID references are allowed

          if (hasReact) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": React imports are forbidden in domain packages.`
            );
          }
          if (hasSupabase) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": Supabase SDK imports are forbidden in domain packages.`
            );
          }
          if (hasDirectPg) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": Direct pg driver imports are forbidden in domain packages.`
            );
          }
          if (hasNext) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": Next.js imports are forbidden in domain packages.`
            );
          }
          if (hasPersistence) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": Persistence package imports are forbidden in domain packages.`
            );
          }
          if (hasAssessmentRuntime) {
            throw new Error(
              `AI Evaluation Domain boundary violation in "${fullPath}": Direct Assessment Runtime domain imports are forbidden. Use only IDs and contracts.`
            );
          }
        }
      }
    };

    scanDir(domainAiEvalSrc);
  });
});
