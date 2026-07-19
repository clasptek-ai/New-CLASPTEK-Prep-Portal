import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

describe('Domain Layer Architectural Boundary Verification', () => {
  const domainSrcPath = path.resolve(__dirname);
  const files = getAllFiles(domainSrcPath);

  test('No React imports in Domain Layer', () => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]react['"]/);
      expect(content).not.toMatch(/import\s+.*react/i);
    });
  });

  test('No Next.js imports in Domain Layer', () => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]next\/.*['"]/);
      expect(content).not.toMatch(/from\s+['"]next['"]/);
    });
  });

  test('No Supabase imports in Domain Layer', () => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]@supabase\/.*['"]/);
    });
  });

  test('No Infrastructure or Curriculum Persistence imports in Domain Layer', () => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/from\s+['"].*persistence\/src\/curriculum.*['"]/);
      expect(content).not.toMatch(/from\s+['"]@clasptek\/persistence['"]/);
    });
  });
});
