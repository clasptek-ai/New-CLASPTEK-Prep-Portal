import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/**/*.test.ts',
      'packages/**/*.test.ts',
      'apps/**/*.test.ts',
      'apps/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@clasptek/kernel': path.resolve(__dirname, './packages/kernel/src/index.ts'),
      '@clasptek/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@clasptek/validation': path.resolve(__dirname, './packages/validation/src/index.ts'),
      '@clasptek/events': path.resolve(__dirname, './packages/events/src/index.ts'),
      '@clasptek/contracts': path.resolve(__dirname, './packages/contracts/src/index.ts'),
      '@clasptek/domain-auth': path.resolve(__dirname, './packages/domain/auth/src/index.ts'),
      '@clasptek/domain-authorization': path.resolve(
        __dirname,
        './packages/domain/authorization/src/index.ts'
      ),
      '@clasptek/domain-security': path.resolve(
        __dirname,
        './packages/domain/security/src/index.ts'
      ),
      '@clasptek/application-auth': path.resolve(
        __dirname,
        './packages/application/auth/src/index.ts'
      ),
      '@clasptek/application-authorization': path.resolve(
        __dirname,
        './packages/application/authorization/src/index.ts'
      ),
      '@clasptek/application-identity-sync': path.resolve(
        __dirname,
        './packages/application/identity-sync/src/index.ts'
      ),
      '@clasptek/infrastructure-access-control': path.resolve(
        __dirname,
        './packages/infrastructure/access-control/src/index.ts'
      ),
      '@clasptek/persistence': path.resolve(__dirname, './packages/persistence/src/index.ts'),
      '@clasptek/domain-learning-resources': path.resolve(
        __dirname,
        './packages/domain/learning-resources/src/index.ts'
      ),
      '@clasptek/application-learning-resources': path.resolve(
        __dirname,
        './packages/application/learning-resources/src/index.ts'
      ),
      '@clasptek/observability': path.resolve(__dirname, './packages/observability/src/index.ts'),
      '@clasptek/configuration': path.resolve(__dirname, './packages/configuration/src/index.ts'),
      '@clasptek/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@clasptek/testing': path.resolve(__dirname, './packages/testing/src/index.ts'),
      '@clasptek/security': path.resolve(__dirname, './packages/security/src/index.ts'),
      '@clasptek/feature-flags': path.resolve(__dirname, './packages/feature-flags/src/index.ts'),
      '@clasptek/domain-identity': path.resolve(
        __dirname,
        './packages/domain/identity/src/index.ts'
      ),
      '@clasptek/application-identity': path.resolve(
        __dirname,
        './packages/application/identity/src/index.ts'
      ),
      '@clasptek/domain-exam-product': path.resolve(
        __dirname,
        './packages/domain/exam-product/src/index.ts'
      ),
      '@clasptek/domain-curriculum': path.resolve(
        __dirname,
        './packages/domain/curriculum/src/index.ts'
      ),
      '@clasptek/application-exam-product': path.resolve(
        __dirname,
        './packages/application/exam-product/src/index.ts'
      ),
      '@clasptek/application-curriculum': path.resolve(
        __dirname,
        './packages/application/curriculum/src/index.ts'
      ),
      '@clasptek/domain-student-learning': path.resolve(
        __dirname,
        './packages/domain/student-learning/src/index.ts'
      ),
      '@clasptek/application-student-learning': path.resolve(
        __dirname,
        './packages/application/student-learning/src/index.ts'
      ),
      '@clasptek/domain-adaptive-practice': path.resolve(
        __dirname,
        './packages/domain/adaptive-practice/src/index.ts'
      ),
      '@clasptek/application-adaptive-practice': path.resolve(
        __dirname,
        './packages/application/adaptive-practice/src/index.ts'
      ),
      '@clasptek/domain-assessment-runtime': path.resolve(
        __dirname,
        './packages/domain/assessment-runtime/src/index.ts'
      ),
      '@clasptek/application-assessment-runtime': path.resolve(
        __dirname,
        './packages/application/assessment-runtime/src/index.ts'
      ),
      '@clasptek/domain-ai-evaluation': path.resolve(
        __dirname,
        './packages/domain/ai-evaluation/src/index.ts'
      ),
      '@clasptek/application-ai-evaluation': path.resolve(
        __dirname,
        './packages/application/ai-evaluation/src/index.ts'
      ),
      '@clasptek/infrastructure-ai-providers': path.resolve(
        __dirname,
        './packages/infrastructure/ai-providers/src/index.ts'
      ),
      '@clasptek/domain-prediction-engine': path.resolve(
        __dirname,
        './packages/domain/prediction-engine/src/index.ts'
      ),
      '@clasptek/application-prediction-engine': path.resolve(
        __dirname,
        './packages/application/prediction-engine/src/index.ts'
      ),
      '@clasptek/domain-diagnostic-placement': path.resolve(
        __dirname,
        './packages/domain/diagnostic-placement/src/index.ts'
      ),
      '@clasptek/application-diagnostic-placement': path.resolve(
        __dirname,
        './packages/application/diagnostic-placement/src/index.ts'
      ),
      '@clasptek/domain-mock-examination': path.resolve(
        __dirname,
        './packages/domain/mock-examination/src/index.ts'
      ),
      '@clasptek/application-mock-examination': path.resolve(
        __dirname,
        './packages/application/mock-examination/src/index.ts'
      ),
      '@clasptek/domain-learning-assistant': path.resolve(
        __dirname,
        './packages/domain/learning-assistant/src/index.ts'
      ),
      '@clasptek/application-learning-assistant': path.resolve(
        __dirname,
        './packages/application/learning-assistant/src/index.ts'
      ),
      '@clasptek/domain-results': path.resolve(__dirname, './packages/domain/results/src/index.ts'),
      '@clasptek/application-results': path.resolve(
        __dirname,
        './packages/application/results/src/index.ts'
      ),
      '@clasptek/domain-notification': path.resolve(
        __dirname,
        './packages/domain/notification/src/index.ts'
      ),
      '@clasptek/domain-announcement': path.resolve(
        __dirname,
        './packages/domain/announcement/src/index.ts'
      ),
      '@clasptek/application-notification': path.resolve(
        __dirname,
        './packages/application/notification/src/index.ts'
      ),
      '@clasptek/application-announcement': path.resolve(
        __dirname,
        './packages/application/announcement/src/index.ts'
      ),
      '@clasptek/domain-learning-analytics': path.resolve(
        __dirname,
        './packages/domain/learning-analytics/src/index.ts'
      ),
      '@clasptek/application-learning-analytics': path.resolve(
        __dirname,
        './packages/application/learning-analytics/src/index.ts'
      ),
    },
  },
});
