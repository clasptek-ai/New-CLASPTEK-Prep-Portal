import { apiClient } from '../api/client';

export interface Programme {
  id: string;
  name: string;
  description: string;
  duration: string;
  studentsEnrolled: number;
  resourcesCount: number;
  assignmentsCount: number;
  averageProgress: number;
  averageMockScore: number;
  averageReadiness: number;
}

export const instructorProgrammesService = {
  async getProgrammes(): Promise<Programme[]> {
    try {
      return await apiClient.get<Programme[]>('/api/v1/instructor/programmes');
    } catch {
      return [
        {
          id: 'p1',
          name: 'IELTS Intensive Preparation',
          description: 'A comprehensive study path designed to boost students to IELTS band 7.5+.',
          duration: '12 weeks',
          studentsEnrolled: 45,
          resourcesCount: 18,
          assignmentsCount: 8,
          averageProgress: 68,
          averageMockScore: 72,
          averageReadiness: 74
        },
        {
          id: 'p2',
          name: 'Core English grammar Masterclass',
          description: 'Focused practice modules covering active modifiers, clauses, and syntax.',
          duration: '6 weeks',
          studentsEnrolled: 35,
          resourcesCount: 10,
          assignmentsCount: 4,
          averageProgress: 82,
          averageMockScore: 79,
          averageReadiness: 81
        }
      ];
    }
  }
};
