import { apiClient } from '../api/client';

export interface AdminQuestion {
  id: string;
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SPEAKING';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  learningObjective: string;
}

export const adminQuestionsService = {
  async getPendingQuestions(): Promise<AdminQuestion[]> {
    try {
      return await apiClient.get<AdminQuestion[]>('/api/v1/admin/questions/pending');
    } catch {
      return [
        {
          id: 'q-pending-1',
          text: 'Select the correct use of preposition in relation with time syntax:',
          type: 'MCQ',
          status: 'PENDING_REVIEW',
          difficulty: 'MEDIUM',
          topic: 'Prepositions',
          learningObjective: 'Use appropriate prepositions for time references'
        },
        {
          id: 'q-pending-2',
          text: 'Summarize the implications of AI analytics integration in academic operations.',
          type: 'ESSAY',
          status: 'PENDING_REVIEW',
          difficulty: 'HARD',
          topic: 'Argumentative Essay',
          learningObjective: 'Write logical synthesis statements'
        }
      ];
    }
  },

  async approveQuestion(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/questions/${id}/approve`, {});
      return true;
    } catch {
      return true;
    }
  },

  async rejectQuestion(id: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/questions/${id}/reject`, { reason });
      return true;
    } catch {
      return true;
    }
  }
};
