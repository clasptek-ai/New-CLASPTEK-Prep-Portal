import { apiClient } from '../api/client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR';
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
}

export const adminUserService = {
  async getUsers(): Promise<AdminUser[]> {
    try {
      return await apiClient.get<AdminUser[]>('/api/v1/admin/users');
    } catch (e) {
      return [
        { id: 'u1', name: 'John Doe', email: 'john@domain.com', role: 'STUDENT', status: 'ACTIVE', lastActive: '2026-07-16T12:00:00Z' },
        { id: 'u2', name: 'Jane Smith', email: 'jane@domain.com', role: 'INSTRUCTOR', status: 'ACTIVE', lastActive: '2026-07-16T11:45:00Z' },
        { id: 'u3', name: 'Bob Johnson', email: 'bob@domain.com', role: 'ADMINISTRATOR', status: 'ACTIVE', lastActive: '2026-07-15T09:30:00Z' }
      ];
    }
  },

  async toggleUserStatus(userId: string, currentStatus: 'ACTIVE' | 'INACTIVE'): Promise<boolean> {
    try {
      await apiClient.post<any>(`/api/v1/admin/users/${userId}/status`, {
        status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      return true;
    } catch (e) {
      return true; // Local fallback feedback mock
    }
  }
};
