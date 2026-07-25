import { apiClient } from '../api/client';

export interface AdminAssessmentConfig {
  id: string;
  title: string;
  type: 'MOCK' | 'PRACTICE';
  durationMinutes: number;
  questionCount: number;
  availableFrom?: string;
  availableUntil?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STORAGE_KEY = 'clasptek_assessments';

const DEFAULT_ASSESSMENTS: AdminAssessmentConfig[] = [
  {
    id: 'exam1',
    title: 'IELTS Academic Full Diagnostic Mock A',
    type: 'MOCK',
    durationMinutes: 180,
    questionCount: 80,
    availableFrom: '2026-07-01T00:00:00Z',
    availableUntil: '2026-12-31T23:59:59Z',
    status: 'PUBLISHED',
  },
  {
    id: 'exam2',
    title: 'TOEFL iBT Reading & Listening Mock B',
    type: 'MOCK',
    durationMinutes: 120,
    questionCount: 60,
    availableFrom: '2026-07-10T00:00:00Z',
    availableUntil: '2026-12-31T23:59:59Z',
    status: 'PUBLISHED',
  },
  {
    id: 'exam3',
    title: 'SAT Mathematics & Evidence-Based Reading Diagnostic',
    type: 'MOCK',
    durationMinutes: 134,
    questionCount: 98,
    status: 'DRAFT',
  },
];

function getStored(): AdminAssessmentConfig[] {
  if (typeof window === 'undefined') return DEFAULT_ASSESSMENTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ASSESSMENTS));
    return DEFAULT_ASSESSMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ASSESSMENTS;
  }
}

function saveStored(list: AdminAssessmentConfig[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export const adminAssessmentsService = {
  async getAssessments(): Promise<AdminAssessmentConfig[]> {
    try {
      const data = await apiClient.get<AdminAssessmentConfig[]>('/api/v1/admin/assessments');
      if (data && data.length > 0) return data;
      return getStored();
    } catch {
      return getStored();
    }
  },

  async scheduleAssessment(id: string, fromDate: string, untilDate: string): Promise<boolean> {
    const list = getStored();
    const updated = list.map((a) =>
      a.id === id ? { ...a, availableFrom: fromDate, availableUntil: untilDate } : a
    );
    saveStored(updated);
    try {
      await apiClient.patch(`/api/v1/admin/assessments/${id}/schedule`, {
        availableFrom: fromDate,
        availableUntil: untilDate,
      });
    } catch {
      // client-side fallback saved above
    }
    return true;
  },

  async publishAssessment(id: string): Promise<boolean> {
    const list = getStored();
    const updated = list.map((a) => (a.id === id ? { ...a, status: 'PUBLISHED' as const } : a));
    saveStored(updated);
    try {
      await apiClient.post(`/api/v1/admin/assessments/${id}/publish`, {});
    } catch {
      // client-side fallback saved above
    }
    return true;
  },

  async createAssessment(config: AdminAssessmentConfig): Promise<boolean> {
    const list = getStored();
    saveStored([config, ...list]);
    return true;
  },
};
