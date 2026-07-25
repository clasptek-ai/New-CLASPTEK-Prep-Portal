import { apiClient } from '../api/client';

export interface AdminQuestion {
  id: string;
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SPEAKING';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  learningObjective: string;
  programmeName?: string;
  category?: 'MOCK' | 'ASSESSMENT' | 'PRACTICE';
}

const STORAGE_KEY = 'clasptek_question_bank';

const DEFAULT_QUESTIONS: AdminQuestion[] = [
  {
    id: 'q-pending-1',
    text: 'Select the correct use of preposition in relation with time syntax:',
    type: 'MCQ',
    status: 'PENDING_REVIEW',
    difficulty: 'MEDIUM',
    topic: 'Prepositions',
    learningObjective: 'Use appropriate prepositions for time references',
    programmeName: 'IELTS Academic',
    category: 'ASSESSMENT',
  },
  {
    id: 'q-pending-2',
    text: 'Summarize the implications of AI analytics integration in academic operations.',
    type: 'ESSAY',
    status: 'PENDING_REVIEW',
    difficulty: 'HARD',
    topic: 'Argumentative Essay',
    learningObjective: 'Write logical synthesis statements',
    programmeName: 'TOEFL iBT',
    category: 'MOCK',
  },
  {
    id: 'q-pending-3',
    text: 'Identify the passage author main stance in paragraph 2 regarding renewable energy costs.',
    type: 'MCQ',
    status: 'APPROVED',
    difficulty: 'HARD',
    topic: 'Reading Comprehension',
    learningObjective: 'Analyze main idea and author intent',
    programmeName: 'SAT',
    category: 'MOCK',
  },
];

function getStoredQuestions(): AdminQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_QUESTIONS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUESTIONS));
    return DEFAULT_QUESTIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

function saveStoredQuestions(questions: AdminQuestion[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }
}

export const adminQuestionsService = {
  async getPendingQuestions(): Promise<AdminQuestion[]> {
    try {
      const data = await apiClient.get<AdminQuestion[]>('/api/v1/admin/questions/pending');
      if (data && data.length > 0) return data;
      return getStoredQuestions();
    } catch {
      return getStoredQuestions();
    }
  },

  async commitBatch(newQuestions: AdminQuestion[]): Promise<boolean> {
    const existing = getStoredQuestions();
    const merged = [...newQuestions, ...existing];
    saveStoredQuestions(merged);
    return true;
  },

  async addQuestion(q: AdminQuestion): Promise<boolean> {
    const existing = getStoredQuestions();
    saveStoredQuestions([q, ...existing]);
    return true;
  },

  async approveQuestion(id: string): Promise<boolean> {
    const existing = getStoredQuestions();
    const updated = existing.map((q) => (q.id === id ? { ...q, status: 'PUBLISHED' as const } : q));
    saveStoredQuestions(updated);
    try {
      await apiClient.post(`/api/v1/admin/questions/${id}/approve`, {});
    } catch {
      // client-side fallback saved above
    }
    return true;
  },

  async rejectQuestion(id: string, reason: string): Promise<boolean> {
    const existing = getStoredQuestions();
    const updated = existing.map((q) => (q.id === id ? { ...q, status: 'ARCHIVED' as const } : q));
    saveStoredQuestions(updated);
    try {
      await apiClient.post(`/api/v1/admin/questions/${id}/reject`, { reason });
    } catch {
      // client-side fallback saved above
    }
    return true;
  },
};
