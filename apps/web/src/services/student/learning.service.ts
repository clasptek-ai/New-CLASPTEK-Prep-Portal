import { apiClient } from '../api/client';

export interface Lesson {
  id: string;
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  durationMinutes: number;
}

export interface ModuleItem {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface EnrolledProgramme {
  id: string;
  name: string;
  currentModule: string;
  completionPercentage: number;
  estimatedCompletionWeeks: number;
  modules: ModuleItem[];
}

export const studentLearningService = {
  async getEnrolledProgrammes(): Promise<EnrolledProgramme[]> {
    try {
      return await apiClient.get<EnrolledProgramme[]>('/api/v1/student/programmes');
    } catch {
      return [
        {
          id: 'p1',
          name: 'IELTS Intensive Preparation Program',
          currentModule: 'Advanced Writing Skills',
          completionPercentage: 62,
          estimatedCompletionWeeks: 4,
          modules: [
            {
              id: 'm1',
              name: 'Advanced Writing Skills',
              lessons: [
                { id: 'l1', title: 'Passive Voice Syntax Constraints', status: 'COMPLETED', durationMinutes: 45 },
                { id: 'l2', title: 'Relative Clauses Modifiers Coherence', status: 'IN_PROGRESS', durationMinutes: 60 },
                { id: 'l3', title: 'Lexical Diversity and Cohesion', status: 'NOT_STARTED', durationMinutes: 50 }
              ]
            },
            {
              id: 'm2',
              name: 'Academic Reading Diagnostics',
              lessons: [
                { id: 'l4', title: 'Skimming and Scanning Strategies', status: 'NOT_STARTED', durationMinutes: 40 },
                { id: 'l5', title: 'Summary Completion Tasks', status: 'NOT_STARTED', durationMinutes: 45 }
              ]
            }
          ]
        }
      ];
    }
  }
};
