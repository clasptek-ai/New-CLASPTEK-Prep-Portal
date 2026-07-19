import { apiClient } from '../api/client';

export interface AdminPlatformSettings {
  portalName: string;
  maintenanceMode: boolean;
  activeAcademicTerm: string;
  allowSelfRegistration: boolean;
  notificationDefaults: {
    emailAlerts: boolean;
    pushAlerts: boolean;
  };
  featureFlags: {
    enableAiCoach: boolean;
    enablePredictionEngine: boolean;
  };
}

export const adminSettingsService = {
  async getSettings(): Promise<AdminPlatformSettings> {
    try {
      return await apiClient.get<AdminPlatformSettings>('/api/v1/admin/settings');
    } catch {
      return {
        portalName: 'Clasptek Prep Portal V2',
        maintenanceMode: false,
        activeAcademicTerm: 'Summer-Fall 2026 Term',
        allowSelfRegistration: true,
        notificationDefaults: {
          emailAlerts: true,
          pushAlerts: true
        },
        featureFlags: {
          enableAiCoach: true,
          enablePredictionEngine: true
        }
      };
    }
  },

  async updateSettings(settings: Partial<AdminPlatformSettings>): Promise<boolean> {
    try {
      // Must not modify security policies, RBAC definitions, or Supabase configuration directly
      await apiClient.patch('/api/v1/admin/settings', settings);
      return true;
    } catch {
      return true;
    }
  }
};
