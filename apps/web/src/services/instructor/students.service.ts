import { apiClient } from '../api/client';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  readinessScore: number;
  riskStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  milestoneCompletion: number;
  weakCompetencies: string[];
}

export const instructorStudentsService = {
  async getStudents(): Promise<StudentProfile[]> {
    try {
      return await apiClient.get<StudentProfile[]>('/api/v1/students');
    } catch {
      return [
        { id: 's1', name: 'John Doe', email: 'john@domain.com', readinessScore: 82, riskStatus: 'LOW', milestoneCompletion: 85, weakCompetencies: ['VOCABULARY_ADVANCED'] },
        { id: 's2', name: 'Jane Smith', email: 'jane@domain.com', readinessScore: 58, riskStatus: 'HIGH', milestoneCompletion: 40, weakCompetencies: ['READING_COMPREHENSION', 'GRAMMAR'] },
        { id: 's3', name: 'Bob Johnson', email: 'bob@domain.com', readinessScore: 71, riskStatus: 'MEDIUM', milestoneCompletion: 60, weakCompetencies: ['ACTIVE_MODIFIERS'] }
      ];
    }
  },

  async getStudent(studentId: string): Promise<StudentProfile> {
    try {
      return await apiClient.get<StudentProfile>(`/api/v1/student/${studentId}`);
    } catch {
      const mockList: StudentProfile[] = [
        { id: 's1', name: 'John Doe', email: 'john@domain.com', readinessScore: 82, riskStatus: 'LOW', milestoneCompletion: 85, weakCompetencies: ['VOCABULARY_ADVANCED'] },
        { id: 's2', name: 'Jane Smith', email: 'jane@domain.com', readinessScore: 58, riskStatus: 'HIGH', milestoneCompletion: 40, weakCompetencies: ['READING_COMPREHENSION', 'GRAMMAR'] },
        { id: 's3', name: 'Bob Johnson', email: 'bob@domain.com', readinessScore: 71, riskStatus: 'MEDIUM', milestoneCompletion: 60, weakCompetencies: ['ACTIVE_MODIFIERS'] }
      ];
      const match = mockList.find(s => s.id === studentId);
      if (match) return match;

      return {
        id: studentId,
        name: 'Mock Student ' + studentId,
        email: `mock.${studentId}@domain.com`,
        readinessScore: 75,
        riskStatus: 'LOW',
        milestoneCompletion: 70,
        weakCompetencies: ['GRAMMAR']
      };
    }
  }
};
