export interface AdminNotification {
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
  createdAt: string;
  targetCohort?: string;
  read?: boolean;
}

const STORAGE_KEY = 'clasptek_announcements';

const DEFAULT_ANNOUNCEMENTS: AdminNotification[] = [
  {
    id: 'ann-1',
    title: 'New Examination Available',
    content: 'IELTS Academic Full Diagnostic Mock A is now open for all enrolled students.',
    type: 'MOCK_AVAILABLE',
    targetCohort: 'All Enrolled Students',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Platform Maintenance Notice',
    content: 'Clasptek Global portal performance upgrades scheduled for Sunday 02:00 UTC.',
    type: 'SYSTEM_ANNOUNCEMENT',
    targetCohort: 'All Enrolled Students',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

function getStored(): AdminNotification[] {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    return DEFAULT_ANNOUNCEMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

function saveStored(list: AdminNotification[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export const adminNotificationsService = {
  async getAnnouncements(): Promise<AdminNotification[]> {
    return getStored();
  },

  async createAnnouncement(
    ann: Omit<AdminNotification, 'id' | 'createdAt'>
  ): Promise<AdminNotification> {
    const list = getStored();
    const created: AdminNotification = {
      ...ann,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveStored([created, ...list]);
    return created;
  },
};
