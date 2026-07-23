import { StudentJourneyStateMachine } from '@clasptek/application-student-learning';

export interface AdminDashboardKPIs {
  totalStudents: number;
  assessmentsCompleted: number;
  practiceActive: number;
  mockAttempts: number;
  avgAssessmentScore: number;
  avgMockScore: number;
  pendingAIEvaluations: number;
}

export class AdminAcademicService {
  public async getDashboardKPIs(): Promise<AdminDashboardKPIs> {
    return {
      totalStudents: 1420,
      assessmentsCompleted: 3850,
      practiceActive: 940,
      mockAttempts: 620,
      avgAssessmentScore: 78.4,
      avgMockScore: 72.1,
      pendingAIEvaluations: 14,
    };
  }

  public async createAssessment(cmd: {
    title: string;
    examProductId: string;
    questionIds: string[];
  }): Promise<{ id: string; status: 'PUBLISHED' }> {
    if (!cmd.title || cmd.questionIds.length === 0) {
      throw new Error('Assessment title and questions are required');
    }
    return { id: `asm-${Date.now()}`, status: 'PUBLISHED' };
  }

  public async createPracticeSet(cmd: {
    title: string;
    questionIds: string[];
  }): Promise<{ id: string; status: 'PUBLISHED' }> {
    if (!cmd.title || cmd.questionIds.length === 0) {
      throw new Error('Practice set title and questions are required');
    }
    return { id: `prac-${Date.now()}`, status: 'PUBLISHED' };
  }

  public async createMockExam(cmd: {
    title: string;
    scoringStrategy: string;
    sections: Array<{ name: string; durationMinutes: number; questionIds: string[] }>;
  }): Promise<{ id: string; status: 'PUBLISHED' }> {
    if (!cmd.title || cmd.sections.length === 0) {
      throw new Error('Mock exam title and sections are required');
    }
    return { id: `mock-${Date.now()}`, status: 'PUBLISHED' };
  }

  public async unlockPractice(
    _studentId: string,
    currentStage: any
  ): Promise<{ success: boolean; newStage: string }> {
    const newStage = StudentJourneyStateMachine.transition(currentStage, 'PRACTICE_UNLOCKED');
    return { success: true, newStage };
  }

  public async unlockMock(
    _studentId: string,
    currentStage: any
  ): Promise<{ success: boolean; newStage: string }> {
    const newStage = StudentJourneyStateMachine.transition(currentStage, 'MOCK_UNLOCKED');
    return { success: true, newStage };
  }
}
