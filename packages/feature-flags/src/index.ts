/**
 * @service FeatureFlags
 * Provider-neutral feature flagging foundation
 */

export interface FeatureFlagContext {
  userId?: string;
  env?: string;
  actorId?: string;
  [key: string]: any;
}

export interface FeatureFlagProvider {
  isEnabled(flagName: string, context?: FeatureFlagContext): Promise<boolean>;
  getVariant(flagName: string, context?: FeatureFlagContext): Promise<string | null>;
}

export class EnvironmentFeatureFlagProvider implements FeatureFlagProvider {
  constructor(private readonly envSource: Record<string, string | undefined> = process.env) {}

  public async isEnabled(flagName: string, _context?: FeatureFlagContext): Promise<boolean> {
    const key = `FEATURE_FLAG_${flagName.toUpperCase()}`;
    const val = this.envSource[key];
    return val === 'true' || val === '1';
  }

  public async getVariant(flagName: string, _context?: FeatureFlagContext): Promise<string | null> {
    const key = `FEATURE_FLAG_${flagName.toUpperCase()}_VARIANT`;
    return this.envSource[key] || null;
  }
}

/**
 * Placeholder Database Provider to satisfy extensible contract signatures
 */
export class DatabaseFeatureFlagProvider implements FeatureFlagProvider {
  public async isEnabled(_flagName: string, _context?: FeatureFlagContext): Promise<boolean> {
    return false;
  }
  public async getVariant(
    _flagName: string,
    _context?: FeatureFlagContext
  ): Promise<string | null> {
    return null;
  }
}

/**
 * Placeholder LaunchDarkly Provider to satisfy extensible contract signatures
 */
export class LaunchDarklyFeatureFlagProvider implements FeatureFlagProvider {
  public async isEnabled(_flagName: string, _context?: FeatureFlagContext): Promise<boolean> {
    return false;
  }
  public async getVariant(
    _flagName: string,
    _context?: FeatureFlagContext
  ): Promise<string | null> {
    return null;
  }
}

/**
 * Placeholder Azure App Configuration Provider to satisfy extensible contract signatures
 */
export class AzureFeatureFlagProvider implements FeatureFlagProvider {
  public async isEnabled(_flagName: string, _context?: FeatureFlagContext): Promise<boolean> {
    return false;
  }
  public async getVariant(
    _flagName: string,
    _context?: FeatureFlagContext
  ): Promise<string | null> {
    return null;
  }
}
