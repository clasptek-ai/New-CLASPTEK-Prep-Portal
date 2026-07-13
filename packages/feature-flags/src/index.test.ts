import { describe, test, expect } from 'vitest';
import { EnvironmentFeatureFlagProvider } from './index';

describe('Feature Flags Unit Tests', () => {
  test('EnvironmentFeatureFlagProvider resolves enabled boolean flags', async () => {
    const mockEnv = {
      FEATURE_FLAG_ENFORCE_MFA: 'true',
      FEATURE_FLAG_USE_NEW_DASHBOARD: '0',
      FEATURE_FLAG_ALPHA_RELEASE_VARIANT: 'canary-a',
    };

    const provider = new EnvironmentFeatureFlagProvider(mockEnv);
    expect(await provider.isEnabled('enforce_mfa')).toBe(true);
    expect(await provider.isEnabled('use_new_dashboard')).toBe(false);
    expect(await provider.isEnabled('absent_flag')).toBe(false);
    expect(await provider.getVariant('alpha_release')).toBe('canary-a');
    expect(await provider.getVariant('absent_flag')).toBeNull();
  });
});
