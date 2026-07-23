import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@clasptek/kernel': path.resolve(process.cwd(), '../kernel/src/index.ts'),
      '@clasptek/validation': path.resolve(process.cwd(), '../validation/src/index.ts'),
      '@clasptek/configuration': path.resolve(process.cwd(), '../configuration/src/index.ts'),
      '@clasptek/observability': path.resolve(process.cwd(), '../observability/src/index.ts'),
      '@clasptek/domain-results': path.resolve(process.cwd(), '../domain/results/src/index.ts'),
      '@clasptek/application-results': path.resolve(
        process.cwd(),
        '../application/results/src/index.ts'
      ),
      '@clasptek/domain-notification': path.resolve(
        process.cwd(),
        '../domain/notification/src/index.ts'
      ),
      '@clasptek/domain-announcement': path.resolve(
        process.cwd(),
        '../domain/announcement/src/index.ts'
      ),
      '@clasptek/application-notification': path.resolve(
        process.cwd(),
        '../application/notification/src/index.ts'
      ),
      '@clasptek/application-announcement': path.resolve(
        process.cwd(),
        '../application/announcement/src/index.ts'
      ),
      '@clasptek/domain-learning-analytics': path.resolve(
        process.cwd(),
        '../domain/learning-analytics/src/index.ts'
      ),
      '@clasptek/application-learning-analytics': path.resolve(
        process.cwd(),
        '../application/learning-analytics/src/index.ts'
      ),
      '@clasptek/domain-diagnostic-placement': path.resolve(
        process.cwd(),
        '../domain/diagnostic-placement/src/index.ts'
      ),
      '@clasptek/application-diagnostic-placement': path.resolve(
        process.cwd(),
        '../application/diagnostic-placement/src/index.ts'
      ),
      '@clasptek/domain-mock-examination': path.resolve(
        process.cwd(),
        '../domain/mock-examination/src/index.ts'
      ),
      '@clasptek/application-mock-examination': path.resolve(
        process.cwd(),
        '../application/mock-examination/src/index.ts'
      ),
      '@clasptek/domain-learning-assistant': path.resolve(
        process.cwd(),
        '../domain/learning-assistant/src/index.ts'
      ),
      '@clasptek/application-learning-assistant': path.resolve(
        process.cwd(),
        '../application/learning-assistant/src/index.ts'
      ),
      '@clasptek/domain-ai-evaluation': path.resolve(
        process.cwd(),
        '../domain/ai-evaluation/src/index.ts'
      ),
      '@clasptek/application-ai-evaluation': path.resolve(
        process.cwd(),
        '../application/ai-evaluation/src/index.ts'
      ),
    },
  },
});
