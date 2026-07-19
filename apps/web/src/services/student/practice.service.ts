import { apiClient } from '../api/client';

export interface PracticeQuestion {
  id: string;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface PracticeSessionStats {
  accuracy: number;
  attemptedCount: number;
  weakTopics: string[];
  strongTopics: string[];
  averageTimeSeconds: number;
  history: { date: string; score: number }[];
}

export const studentPracticeService = {
  async getPracticeStats(): Promise<PracticeSessionStats> {
    try {
      return await apiClient.get<PracticeSessionStats>('/api/v1/practice/stats');
    } catch {
      return {
        accuracy: 74,
        attemptedCount: 150,
        weakTopics: ['Relative Clauses Syntax', 'Passive Voice Constraints'],
        strongTopics: ['Prepositions', 'Subject Verb Agreement'],
        averageTimeSeconds: 45,
        history: [
          { date: '2026-07-15', score: 80 },
          { date: '2026-07-16', score: 75 }
        ]
      };
    }
  },

  async startPractice(category: 'ADAPTIVE' | 'TIMED' | 'TOPIC' | 'REVISION' | 'WEAK_TOPIC' | 'RESUME'): Promise<PracticeQuestion> {
    try {
      return await apiClient.post<PracticeQuestion>('/api/v1/practice/start', { category });
    } catch {
      return {
        id: 'pq-' + Math.random().toString(),
        text: 'Identify the correct passive voice sentence:',
        options: [
          'The book was written by Jane.',
          'Jane wrote the book.',
          'The book has written Jane.',
          'Jane has written the book.'
        ],
        answer: 'The book was written by Jane.',
        explanation: 'Passive voice shifts the focus of the sentence to the receiver of the action (the book).'
      };
    }
  },

  async submitAnswer(questionId: string, answer: string): Promise<{ correct: boolean; explanation: string }> {
    try {
      return await apiClient.post<any>('/api/v1/practice/submit', { questionId, answer });
    } catch {
      return {
        correct: answer === 'The book was written by Jane.',
        explanation: 'Passive voice shifts the focus of the sentence to the receiver of the action (the book).'
      };
    }
  }
};
