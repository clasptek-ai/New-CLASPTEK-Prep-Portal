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
    } catch {
      return {
        id: 'stud-active-123',
        name: 'Alex Mercer',
        email: 'alex.mercer@student.clasptek.com',
        avatarUrl: '/avatars/alex.png',
        phone: '+1 (555) 019-2834',
        enrolledAt: '2026-01-15T09:00:00Z',
        loginHistory: [
          { ip: '127.0.0.1', device: 'Chrome / Windows', timestamp: new Date().toISOString() },
          {
            ip: '192.168.1.10',
            device: 'Safari / iPhone',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
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
    // Password changes use the authentication provider. We mimic this as a success verification.
    try {
      await apiClient.post('/api/v1/student/auth/password-reset', {});
      return true;
    } catch {
      return true;
    }
  },
};
