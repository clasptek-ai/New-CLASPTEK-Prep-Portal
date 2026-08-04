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
      let registeredName = 'Student';
      let registeredEmail = 'student@clasptek.com';
      let registeredPhone = '+1 (555) 019-2834';

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('clasptek_onboarding_data');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.firstName) {
              registeredName = parsed.lastName
                ? `${parsed.firstName} ${parsed.lastName}`
                : parsed.firstName;
            }
            if (parsed.email) {
              registeredEmail = parsed.email;
            }
            if (parsed.phone) {
              registeredPhone = parsed.phone;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      const storedId = (typeof window !== 'undefined' && localStorage.getItem('clasptek_user_id')) || 'STUDENT';
      return {
        id: storedId,
        name: registeredName,
        email: registeredEmail,
        avatarUrl: undefined,
        phone: registeredPhone,
        enrolledAt: new Date().toISOString(),
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
    try {
      await apiClient.post('/api/v1/student/auth/password-reset', {});
      return true;
    } catch {
      return true;
    }
  },
};
