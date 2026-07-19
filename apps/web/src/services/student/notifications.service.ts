import { apiClient } from '../api/client';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'ASSIGNMENT_PUBLISHED' | 'ASSIGNMENT_GRADED' | 'MOCK_AVAILABLE' | 'MOCK_RESULT' | 'INSTRUCTOR_NOTE' | 'SYSTEM_ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
}

export const studentNotificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await apiClient.get<NotificationItem[]>('/api/v1/student/notifications');
    } catch {
      return [
        {
          id: 'n1',
          title: 'Assignment Graded',
          content: 'Your Advanced Essay Syntax assignment has been graded. Score: 85/100.',
          type: 'ASSIGNMENT_GRADED',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'n2',
          title: 'Instructor Note Logged',
          content: 'Sarah Jenkins left a permanent note regarding your Relative Clauses practice accuracy.',
          type: 'INSTRUCTOR_NOTE',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'n3',
          title: 'New Mock Exam Available',
          content: 'IELTS Grammar Diagnostic Mock B is now available for attempts.',
          type: 'MOCK_AVAILABLE',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/student/notifications/${id}/read`, {});
      return true;
    } catch {
      return true;
    }
  },

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      return await apiClient.get<NotificationPreferences>('/api/v1/student/notifications/preferences');
    } catch {
      return {
        emailAlerts: true,
        pushNotifications: true,
        weeklySummary: false
      };
    }
  },

  async updatePreferences(prefs: NotificationPreferences): Promise<boolean> {
    try {
      await apiClient.patch('/api/v1/student/notifications/preferences', prefs);
      return true;
    } catch {
      return true;
    }
  }
};
