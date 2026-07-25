import { apiClient } from '../api/client';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type:
    | 'ASSIGNMENT_PUBLISHED'
    | 'ASSIGNMENT_GRADED'
    | 'MOCK_AVAILABLE'
    | 'MOCK_RESULT'
    | 'INSTRUCTOR_NOTE'
    | 'SYSTEM_ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
  targetCohort?: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
}

const STORAGE_KEY = 'clasptek_announcements';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Examination Available',
    content: 'IELTS Academic Full Diagnostic Mock A is now open for all enrolled students.',
    type: 'MOCK_AVAILABLE',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Platform Maintenance Notice',
    content: 'Clasptek Global portal performance upgrades scheduled for Sunday 02:00 UTC.',
    type: 'SYSTEM_ANNOUNCEMENT',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n3',
    title: 'Assignment Graded',
    content: 'Your Advanced Essay Syntax assignment has been graded. Score: 85/100.',
    type: 'ASSIGNMENT_GRADED',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function saveStoredNotifications(list: NotificationItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export const studentNotificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await apiClient.get<NotificationItem[]>('/api/v1/student/notifications');
      if (data && data.length > 0) return data;
      return getStoredNotifications();
    } catch {
      return getStoredNotifications();
    }
  },

  async publishAnnouncement(
    announcement: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>
  ): Promise<boolean> {
    const list = getStoredNotifications();
    const created: NotificationItem = {
      ...announcement,
      id: `ann-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    saveStoredNotifications([created, ...list]);
    return true;
  },

  async markAsRead(id: string): Promise<boolean> {
    const list = getStoredNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveStoredNotifications(updated);
    try {
      await apiClient.post(`/api/v1/student/notifications/${id}/read`, {});
    } catch {
      // client-side fallback saved above
    }
    return true;
  },

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      return await apiClient.get<NotificationPreferences>(
        '/api/v1/student/notifications/preferences'
      );
    } catch {
      return {
        emailAlerts: true,
        pushNotifications: true,
        weeklySummary: false,
      };
    }
  },

  async updatePreferences(prefs: NotificationPreferences): Promise<boolean> {
    try {
      await apiClient.patch('/api/v1/student/notifications/preferences', prefs);
    } catch {
      // client-side fallback
    }
    return true;
  },
};
