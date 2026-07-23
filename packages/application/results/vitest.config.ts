import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@clasptek/kernel': path.resolve(process.cwd(), '../../kernel/src/index.ts'),
      '@clasptek/validation': path.resolve(process.cwd(), '../../validation/src/index.ts'),
      '@clasptek/domain-results': path.resolve(process.cwd(), '../../domain/results/src/index.ts'),
    },
  },
});
