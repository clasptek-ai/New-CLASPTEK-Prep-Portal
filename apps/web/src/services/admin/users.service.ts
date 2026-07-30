import { apiClient } from '../api/client';

export interface AdminUserRecord {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'STAFF';
  status: 'ACTIVE' | 'SUSPENDED';
  programme: string;
  practiceUnlocked: boolean;
  mockUnlocked: boolean;
  registeredDate: string;
  lastLogin?: string;
  statusHistory: {
    status: 'ACTIVE' | 'SUSPENDED';
    changedBy: string;
    date: string;
    reason: string;
  }[];
}

const STORAGE_KEY = 'clasptek_users_db';

const DEFAULT_STUDENTS: AdminUserRecord[] = [
  {
    id: 'u-admin-001',
    registrationNumber: 'CGA-ADMIN-00001',
    name: 'CLASPTEK Executive Administrator',
    email: 'admin@clasptek.com',
    phone: '+1 800 555 0100',
    role: 'ADMINISTRATOR',
    status: 'ACTIVE',
    programme: 'Platform Governance & Exam Operations',
    practiceUnlocked: true,
    mockUnlocked: true,
    registeredDate: '2026-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    statusHistory: [
      {
        status: 'ACTIVE',
        changedBy: 'System Bootstrapper',
        date: '2026-01-01T00:00:00Z',
        reason: 'Master Administrator Provisioning',
      },
    ],
  },
];

function getStoredUsers(): AdminUserRecord[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STUDENTS;
  }
}

function saveStoredUsers(users: AdminUserRecord[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export const adminUsersService = {
  async getUsers(): Promise<AdminUserRecord[]> {
    try {
      const res = await apiClient.get<any>('/api/v1/admin/users');
      const data =
        res && res.success && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      if (data && data.length > 0) return data;
      return getStoredUsers();
    } catch {
      return getStoredUsers();
    }
  },

  async addStudent(
    newStudent: Omit<
      AdminUserRecord,
      'id' | 'registrationNumber' | 'statusHistory' | 'registeredDate'
    >
  ): Promise<AdminUserRecord> {
    const list = getStoredUsers();
    const created: AdminUserRecord = {
      ...newStudent,
      id: `u-${Date.now()}`,
      registrationNumber: `CGA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      registeredDate: new Date().toISOString(),
      statusHistory: [
        {
          status: newStudent.status,
          changedBy: 'Admin Portal',
          date: new Date().toISOString(),
          reason: 'Manual registration by administrator',
        },
      ],
    };
    saveStoredUsers([created, ...list]);
    return created;
  },

  async togglePracticeGate(id: string): Promise<boolean> {
    const list = getStoredUsers();
    const updated = list.map((u) =>
      u.id === id ? { ...u, practiceUnlocked: !u.practiceUnlocked } : u
    );
    saveStoredUsers(updated);
    return true;
  },

  async toggleMockGate(id: string): Promise<boolean> {
    const list = getStoredUsers();
    const updated = list.map((u) => (u.id === id ? { ...u, mockUnlocked: !u.mockUnlocked } : u));
    saveStoredUsers(updated);
    return true;
  },

  async updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason: string
  ): Promise<boolean> {
    const list = getStoredUsers();
    const updated = list.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          status,
          statusHistory: [
            { status, changedBy: 'Administrator', date: new Date().toISOString(), reason },
            ...u.statusHistory,
          ],
        };
      }
      return u;
    });
    saveStoredUsers(updated);
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/status`, { status, reason });
    } catch {
      // fallback
    }
    return true;
  },

  async assignRole(
    id: string,
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'STAFF'
  ): Promise<boolean> {
    const list = getStoredUsers();
    const updated = list.map((u) => (u.id === id ? { ...u, role } : u));
    saveStoredUsers(updated);
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/role`, { role });
    } catch {
      // fallback
    }
    return true;
  },

  async initiatePasswordReset(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/users/${id}/password-reset`, {});
    } catch {
      // fallback
    }
    return true;
  },
};
