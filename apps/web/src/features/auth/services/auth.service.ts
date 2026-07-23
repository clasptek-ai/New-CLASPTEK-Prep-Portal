import { apiClient } from '../../../services/api/client';
import { API_ENDPOINTS } from '../../../shared/config/api.config';
import { LoginCredentials, RegisterPayload, UserSession, CanonicalRole } from '../types/auth.types';

export function normalizeRole(rawRole: string): CanonicalRole {
  const r = (rawRole || '').toUpperCase().trim();
  if (
    r === 'SUPER ADMINISTRATOR' ||
    r === 'SYSTEM_ADMIN' ||
    r === 'SUPER_ADMIN' ||
    r === 'ADMINISTRATOR' ||
    r === 'ADMIN'
  ) {
    return 'ADMINISTRATOR';
  }
  if (r === 'INSTRUCTOR' || r === 'SUPERVISOR') {
    return 'INSTRUCTOR';
  }
  return 'STUDENT';
}

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: UserSession; roles: CanonicalRole[] }> {
    const data = await apiClient.post<{
      success: boolean;
      user: { id: string; email: string };
      roles: string[];
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    const roles = (data.roles || []).map(normalizeRole);
    return {
      user: {
        userId: data.user.id,
        email: data.user.email,
        roles,
        isAuthenticated: true,
      },
      roles,
    };
  },

  async getSession(): Promise<UserSession | null> {
    try {
      const data = await apiClient.get<{
        success: boolean;
        user: { id: string; email: string };
        roles: string[];
      }>(API_ENDPOINTS.AUTH.SESSION);

      if (!data || !data.user) return null;
      const roles = (data.roles || []).map(normalizeRole);

      return {
        userId: data.user.id,
        email: data.user.email,
        roles,
        isAuthenticated: true,
      };
    } catch {
      return null;
    }
  },

  async register(payload: RegisterPayload): Promise<boolean> {
    const data = await apiClient.post<{ success: boolean }>(API_ENDPOINTS.AUTH.REGISTER, payload);
    return data.success;
  },

  async logout(): Promise<boolean> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      return true;
    } catch {
      return true;
    }
  },
};
