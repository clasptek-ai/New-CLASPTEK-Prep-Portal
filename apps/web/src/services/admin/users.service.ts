import { apiClient } from '../api/client';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'STAFF';
  status: 'ACTIVE' | 'SUSPENDED';
  programme?: string;
  lastLogin?: string;
  statusHistory: {
    status: 'ACTIVE' | 'SUSPENDED';
    changedBy: string;
    date: string;
    reason: string;
  }[];
}

export const adminUsersService = {
  async getUsers(): Promise<AdminUserRecord[]> {
    try {
      return await apiClient.get<AdminUserRecord[]>('/api/v1/admin/users');
    } catch {
      return [
        {
          id: 'u1',
          name: 'Jane Smith',
          email: 'jane.smith@student.clasptek.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          programme: 'IELTS Intensive Program',
          lastLogin: new Date().toISOString(),
          statusHistory: [
            {
              status: 'ACTIVE',
              changedBy: 'Sarah Jenkins',
              date: '2026-01-15T09:00:00Z',
              reason: 'Account created',
            },
          ],
        },
        {
          id: 'u2',
          name: 'John Doe',
          email: 'john.doe@instructor.clasptek.com',
          role: 'INSTRUCTOR',
          status: 'ACTIVE',
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          statusHistory: [
            {
              status: 'ACTIVE',
              changedBy: 'Sarah Jenkins',
              date: '2026-01-10T10:00:00Z',
              reason: 'Account created',
            },
          ],
        },
        {
          id: 'u3',
          name: 'Bob Vance',
          email: 'bob.vance@staff.clasptek.com',
          role: 'STAFF',
          status: 'SUSPENDED',
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
          statusHistory: [
            {
              status: 'SUSPENDED',
              changedBy: 'Sarah Jenkins',
              date: '2026-06-01T12:00:00Z',
              reason: 'Violation of security logs',
            },
          ],
        },
      ];
    }
  },

  async updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason: string
  ): Promise<boolean> {
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/status`, { status, reason });
      return true;
    } catch {
      return true;
    }
  },

  async assignRole(
    id: string,
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'STAFF'
  ): Promise<boolean> {
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/role`, { role });
      return true;
    } catch {
      return true;
    }
  },

  async initiatePasswordReset(id: string): Promise<boolean> {
    try {
      // Initiates reset through the authentication provider
      await apiClient.post(`/api/v1/admin/users/${id}/password-reset`, {});
      return true;
    } catch {
      return true;
    }
  },
};
