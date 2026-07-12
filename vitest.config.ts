import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts'],
    alias: {
      '@clasptek/kernel': path.resolve(__dirname, './packages/kernel/src/index.ts'),
      '@clasptek/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@clasptek/validation': path.resolve(__dirname, './packages/validation/src/index.ts'),
      '@clasptek/events': path.resolve(__dirname, './packages/events/src/index.ts'),
      '@clasptek/contracts': path.resolve(__dirname, './packages/contracts/src/index.ts'),
      '@clasptek/authorization': path.resolve(__dirname, './packages/authorization/src/index.ts'),
      '@clasptek/persistence': path.resolve(__dirname, './packages/persistence/src/index.ts'),
      '@clasptek/observability': path.resolve(__dirname, './packages/observability/src/index.ts'),
      '@clasptek/configuration': path.resolve(__dirname, './packages/configuration/src/index.ts'),
      '@clasptek/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@clasptek/testing': path.resolve(__dirname, './packages/testing/src/index.ts'),
    },
  },
});
