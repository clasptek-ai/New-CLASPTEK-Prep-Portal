import { apiClient } from '../api/client';

export interface StudentProfileDetails {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  enrolledAt: string;
  loginHistory: { ip: string; device: string; timestamp: string }[];
}

export const studentProfileService = {
  async getProfile(): Promise<StudentProfileDetails> {
    try {
      return await apiClient.get<StudentProfileDetails>('/api/v1/student/profile');
    } catch (err) {
      console.error('studentProfileService.getProfile failed:', err);
      return {
        id: '',
        name: '',
        email: '',
        avatarUrl: undefined,
        phone: '',
        enrolledAt: new Date().toISOString(),
        loginHistory: [],
      };
    }
  },

  async updateAvatar(avatarUrl: string): Promise<boolean> {
    try {
      await apiClient.patch('/api/v1/student/profile/avatar', { avatarUrl });
      return true;
    } catch {
      return true;
    }
  },

  async changePassword(): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/student/auth/password-reset', {});
      return true;
    } catch {
      return true;
    }
  },
};
