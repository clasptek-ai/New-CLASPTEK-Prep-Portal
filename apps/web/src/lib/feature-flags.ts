export interface FeatureFlags {
  betaFeatures: boolean;
  aiCapabilities: boolean;
  experimentalDashboards: boolean;
  institutionSpecificModules: boolean;
}

const defaultFlags: FeatureFlags = {
  betaFeatures: false,
  aiCapabilities: true,
  experimentalDashboards: true,
  institutionSpecificModules: false,
};

export const featureFlagsManager = {
  getFlags(): FeatureFlags {
    try {
      const saved = localStorage.getItem('app-feature-flags');
      if (saved) {
        return { ...defaultFlags, ...JSON.parse(saved) };
      }
    } catch {
      // Offline / SSR fallback
    }
    return defaultFlags;
  },

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.getFlags()[flag];
  },

  setFlag(flag: keyof FeatureFlags, enabled: boolean) {
    try {
      const current = this.getFlags();
      current[flag] = enabled;
      localStorage.setItem('app-feature-flags', JSON.stringify(current));
    } catch {
      // Ignored in SSR
    }
  },
};
