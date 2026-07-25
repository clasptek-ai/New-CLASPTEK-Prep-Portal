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
    id: 'u-101',
    registrationNumber: 'CGA-2026-00101',
    name: 'Alex Mercer',
    email: 'alex.mercer@student.clasptek.com',
    phone: '+44 7700 900077',
    role: 'STUDENT',
    status: 'ACTIVE',
    programme: 'IELTS Academic Intensive',
    practiceUnlocked: true,
    mockUnlocked: true,
    registeredDate: '2026-06-10T10:00:00Z',
    lastLogin: new Date().toISOString(),
    statusHistory: [
      {
        status: 'ACTIVE',
        changedBy: 'Clasptek Admin System',
        date: '2026-06-10T10:00:00Z',
        reason: 'Initial enrollment',
      },
    ],
  },
  {
    id: 'u-102',
    registrationNumber: 'CGA-2026-00102',
    name: 'Sarah Connor',
    email: 'sarah.c@student.clasptek.com',
    phone: '+1 555 019 2831',
    role: 'STUDENT',
    status: 'ACTIVE',
    programme: 'TOEFL iBT Mastery',
    practiceUnlocked: true,
    mockUnlocked: false,
    registeredDate: '2026-06-18T14:30:00Z',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    statusHistory: [
      {
        status: 'ACTIVE',
        changedBy: 'Clasptek Admin System',
        date: '2026-06-18T14:30:00Z',
        reason: 'Initial enrollment',
      },
    ],
  },
  {
    id: 'u-103',
    registrationNumber: 'CGA-2026-00103',
    name: 'Michael Scott',
    email: 'michael.scott@student.clasptek.com',
    phone: '+1 555 014 9988',
    role: 'STUDENT',
    status: 'ACTIVE',
    programme: 'SAT Academic Preparation',
    practiceUnlocked: true,
    mockUnlocked: true,
    registeredDate: '2026-07-01T09:15:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    statusHistory: [
      {
        status: 'ACTIVE',
        changedBy: 'Clasptek Admin System',
        date: '2026-07-01T09:15:00Z',
        reason: 'Initial enrollment',
      },
    ],
  },
  {
    id: 'u-104',
    registrationNumber: 'CGA-2026-00104',
    name: 'Boluwaji Daniels',
    email: 'boluwaji.daniels@student.clasptek.com',
    phone: '+234 803 123 4567',
    role: 'STUDENT',
    status: 'ACTIVE',
    programme: 'CELPIP General Coaching',
    practiceUnlocked: true,
    mockUnlocked: true,
    registeredDate: '2026-07-12T11:00:00Z',
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    statusHistory: [
      {
        status: 'ACTIVE',
        changedBy: 'Clasptek Admin System',
        date: '2026-07-12T11:00:00Z',
        reason: 'Initial enrollment',
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
      const data = await apiClient.get<AdminUserRecord[]>('/api/v1/admin/users');
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
