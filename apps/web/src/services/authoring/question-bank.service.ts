import { apiClient } from '../api/client';

export interface AuthoringQuestion {
  id: string;
  title: string;
  body: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  competencies: string[];
  version: number;
}

export const authoringQuestionBankService = {
  async getQuestions(): Promise<AuthoringQuestion[]> {
    try {
      return await apiClient.get<AuthoringQuestion[]>('/api/v1/questions');
    } catch (_e) {
      return [
        {
          id: 'q1',
          title: 'Adjective Modifiers Selection',
          body: 'Identify the active adjective modifier in the sentence.',
          difficulty: 'MEDIUM',
          status: 'DRAFT',
          competencies: ['GRAMMAR'],
          version: 1,
        },
        {
          id: 'q2',
          title: 'Vocabulary Definitions Mock',
          body: 'Which option best matches the definition of vocabulary core?',
          difficulty: 'EASY',
          status: 'PUBLISHED',
          competencies: ['VOCABULARY_ADVANCED'],
          version: 2,
        },
        {
          id: 'q3',
          title: 'Speaking Accent Diagnostics',
          body: 'Speak the requested paragraph focusing on syllable structure emphasis.',
          difficulty: 'HARD',
          status: 'PENDING_REVIEW',
          competencies: ['SPEAKING_PRONUNCIATION'],
          version: 1,
        },
      ];
    }
  },

  async getQuestion(id: string): Promise<AuthoringQuestion> {
    try {
      return await apiClient.get<AuthoringQuestion>(`/api/v1/questions/${id}`);
    } catch (_e) {
      const all = await this.getQuestions();
      return all.find((item) => item.id === id) || all[0];
    }
  },
};
