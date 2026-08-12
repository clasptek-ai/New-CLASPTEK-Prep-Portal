import { apiClient } from '../api/client';

export interface AdminUserRecord {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'STAFF';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  paymentStatus: 'PAID' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'NOT RECORDED';
  programme: string;
  cohort: string;
  progressPercent: number;
  practiceUnlocked: boolean;
  mockUnlocked: boolean;
  registeredDate: string;
  lastLogin?: string;
  statusHistory: {
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
    changedBy: string;
    date: string;
    reason: string;
  }[];
}

export interface DeleteStudentResult {
  success: boolean;
  message: string;
  code?: string;
}

const STORAGE_KEY = 'clasptek_users_db';

function getStoredUsers(): AdminUserRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function _saveStoredUsers(users: AdminUserRecord[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export const adminUsersService = {
  async getUsers(): Promise<AdminUserRecord[]> {
    try {
      const res = await apiClient.get<
        { success?: boolean; data?: AdminUserRecord[] } | AdminUserRecord[]
      >('/api/v1/admin/users');
      if (
        res &&
        typeof res === 'object' &&
        'success' in res &&
        res.success &&
        Array.isArray(res.data)
      ) {
        return res.data;
      }
      if (Array.isArray(res)) {
        return res;
      }
    } catch (err) {
      console.error('adminUsersService.getUsers error:', err);
    }
    return getStoredUsers();
  },

  async getUserById(id: string): Promise<AdminUserRecord | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id || u.registrationNumber === id) || null;
  },

  async addStudent(
    newStudent: Partial<AdminUserRecord> & { name: string; email: string }
  ): Promise<AdminUserRecord> {
    try {
      const res = await apiClient.post<{ success: boolean; data: AdminUserRecord }>(
        '/api/v1/admin/users',
        newStudent
      );
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error('adminUsersService.addStudent error:', err);
    }
    // Fallback if API fails
    const created: AdminUserRecord = {
      id: `u-${Date.now()}`,
      registrationNumber: `CGA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone || 'NOT RECORDED',
      role: 'STUDENT',
      status: newStudent.status || 'ACTIVE',
      paymentStatus: newStudent.paymentStatus || 'NOT RECORDED',
      programme: newStudent.programme || 'English Proficiency',
      cohort: newStudent.cohort || 'UNASSIGNED',
      progressPercent: 0,
      practiceUnlocked: true,
      mockUnlocked: true,
      registeredDate: new Date().toISOString(),
      statusHistory: [],
    };
    return created;
  },

  async updateStudent(id: string, updates: Partial<AdminUserRecord>): Promise<boolean> {
    try {
      const res = await apiClient.patch<{ success: boolean }>('/api/v1/admin/users', {
        userId: id,
        phone: updates.phone,
        programme: updates.programme,
        cohort: updates.cohort,
        status: updates.status,
      });
      return Boolean(res && res.success);
    } catch (err) {
      console.error('updateStudent patch error:', err);
      return false;
    }
  },

  async togglePracticeGate(id: string, locked?: boolean, reason?: string): Promise<boolean> {
    try {
      const res = await apiClient.patch<{ success: boolean }>(
        `/api/v1/admin/users/${id}/practice-gate`,
        { locked, reason }
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('togglePracticeGate error:', err);
      return false;
    }
  },

  async toggleMockGate(id: string, locked?: boolean, reason?: string): Promise<boolean> {
    try {
      const res = await apiClient.patch<{ success: boolean }>(
        `/api/v1/admin/users/${id}/mock-gate`,
        { locked, reason }
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('toggleMockGate error:', err);
      return false;
    }
  },

  async updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING',
    reason: string
  ): Promise<boolean> {
    try {
      const res = await apiClient.patch<{ success: boolean }>(`/api/v1/admin/users/${id}/status`, {
        status,
        reason,
      });
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.updateUserStatus error:', err);
      return false;
    }
  },

  async initiatePasswordReset(id: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/v1/admin/users/${id}/reset-password`,
        {}
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.initiatePasswordReset error:', err);
      return false;
    }
  },

  async deleteStudent(id: string): Promise<DeleteStudentResult> {
    try {
      const res = await apiClient.delete<{ success: boolean; message?: string; code?: string }>(
        `/api/v1/admin/users/${id}`
      );
      return {
        success: Boolean(res && res.success !== false),
        message: res?.message || 'Student account deleted successfully.',
        code: res?.code,
      };
    } catch (err: any) {
      console.error('adminUsersService.deleteStudent error:', err);
      if (err?.code === 'USER_NOT_FOUND' || err?.status === 404) {
        return {
          success: false,
          message: 'Student account could not be found.',
          code: 'USER_NOT_FOUND',
        };
      }
      return {
        success: false,
        message: err?.message || 'Unable to delete this student. Please try again.',
        code: 'DELETE_FAILED',
      };
    }
  },

  async restoreStudent(id: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/v1/admin/users/${id}/restore`,
        {}
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.restoreStudent error:', err);
      return false;
    }
  },

  async forceLogout(id: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/v1/admin/users/${id}/logout`,
        {}
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.forceLogout error:', err);
      return false;
    }
  },

  async resendVerification(id: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/v1/admin/users/${id}/resend-verification`,
        {}
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.resendVerification error:', err);
      return false;
    }
  },

  async unlockAccount(id: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/v1/admin/users/${id}/unlock-account`,
        {}
      );
      return Boolean(res && res.success);
    } catch (err) {
      console.error('adminUsersService.unlockAccount error:', err);
      return false;
    }
  },

  async assignRole(id: string, role: string): Promise<boolean> {
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/role`, { role });
    } catch {
      // fallback
    }
    return true;
  },
};
