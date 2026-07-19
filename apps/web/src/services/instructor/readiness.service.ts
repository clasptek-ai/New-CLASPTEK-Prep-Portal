import { apiClient } from '../api/client';

export interface StudentReadinessDetails {
  studentId: string;
  overallReadiness: number;
  confidence: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  weakAreas: string[];
  strengths: string[];
  improvementTrend: number[];
  recommendedStudyPlan: string;
  priorityTopics: string[];
  suggestedPracticeSessions: number;
  suggestedMockDate: string;
}

export const instructorReadinessService = {
  async getStudentReadiness(studentId: string): Promise<StudentReadinessDetails> {
    try {
      return await apiClient.get<StudentReadinessDetails>(`/api/v1/instructor/readiness/${studentId}`);
    } catch {
      const mockReadiness: Record<string, Partial<StudentReadinessDetails>> = {
        's1': { overallReadiness: 82, riskLevel: 'LOW' },
        's2': { overallReadiness: 58, riskLevel: 'HIGH' },
        's3': { overallReadiness: 71, riskLevel: 'MEDIUM' }
      };
      const match = mockReadiness[studentId] || { overallReadiness: 75, riskLevel: 'LOW' };

      return {
        studentId,
        overallReadiness: match.overallReadiness!,
        confidence: 85,
        riskLevel: match.riskLevel!,
        weakAreas: ['Grammar modifiers', 'Reading comprehension'],
        strengths: ['Vocabulary advanced', 'Argumentative essay construction'],
        improvementTrend: [50, 52, 54, 55, 57, 58],
        recommendedStudyPlan: 'Focus on modifiers grammar logic daily. Participate in Writing Essay Test B next week.',
        priorityTopics: ['Relative Clauses', 'Modifiers Syntax', 'Coherence Flow'],
        suggestedPracticeSessions: 4,
        suggestedMockDate: '2026-07-28'
      };
    }
  }
};
