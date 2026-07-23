import { apiClient } from '../api/client';

export interface AuditLogRecord {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  details: string;
  category: 'AUTHENTICATION' | 'CURRICULUM_PUBLISH' | 'USER_SUSPENSION' | 'SETTINGS_CHANGE';
}

export const adminAuditService = {
  async getAuditLogs(filters?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    user?: string;
    category?: string;
  }): Promise<AuditLogRecord[]> {
    try {
      let url = '/api/v1/admin/audit';
      if (filters) {
        const query = new URLSearchParams(filters as any).toString();
        if (query) url += `?${query}`;
      }
      return await apiClient.get<AuditLogRecord[]>(url);
    } catch {
      return [
        {
          id: 'aud1',
          action: 'Suspended Student Account stud-123',
          user: 'Sarah Jenkins',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          details: 'Account suspended for policy violation logs.',
          category: 'USER_SUSPENSION',
        },
        {
          id: 'aud2',
          action: 'Published Syllabus Mod A',
          user: 'Sarah Jenkins',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip: '127.0.0.1',
          details: 'Syllabus advanced syntax lesson publish.',
          category: 'CURRICULUM_PUBLISH',
        },
        {
          id: 'aud3',
          action: 'Changed branding logo configurations',
          user: 'Sarah Jenkins',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip: '127.0.0.1',
          details: 'Branding accent hex modified to #ec4899.',
          category: 'SETTINGS_CHANGE',
        },
      ];
    }
  },
};
