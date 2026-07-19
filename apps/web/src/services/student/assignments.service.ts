import { apiClient } from '../api/client';

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'FILE' | 'TEXT' | 'HYBRID';
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'LATE';
  submittedAt?: string;
  fileUrl?: string;
  grade?: number;
  instructorFeedback?: string;
  aiEvaluation?: {
    grammarScore: number;
    coherenceScore: number;
    lexicalScore: number;
    overallFeedback: string;
  };
}

export const studentAssignmentsService = {
  async getAssignments(): Promise<StudentAssignment[]> {
    try {
      return await apiClient.get<StudentAssignment[]>('/api/v1/student/assignments');
    } catch {
      return [
        {
          id: 'as1',
          title: 'Advanced Essay Syntax Assignment',
          description: 'Draft a 500-word argumentative essay focusing on modifiers structure.',
          instructions: 'Submit as PDF or DOCX before due date.',
          dueDate: '2026-07-24',
          maxScore: 100,
          submissionType: 'FILE',
          status: 'GRADED',
          submittedAt: '2026-07-16T15:30:00Z',
          fileUrl: 'https://supabase.co/storage/v1/object/public/submissions/alex_essay.pdf',
          grade: 85,
          instructorFeedback: 'Well structured modifier syntax. Ensure paragraph transitions are explicit.',
          aiEvaluation: {
            grammarScore: 82,
            coherenceScore: 85,
            lexicalScore: 88,
            overallFeedback: 'Grammar active modifier modifiers structure is strong. Lexical variety is within band 7.5.'
          }
        },
        {
          id: 'as2',
          title: 'Relative Clauses Grammar Quiz',
          description: 'Fill in lexical review templates online.',
          instructions: 'Complete input fields online.',
          dueDate: '2026-08-01',
          maxScore: 50,
          submissionType: 'TEXT',
          status: 'PENDING'
        }
      ];
    }
  },

  async submitAssignment(id: string, fileUrl: string, textContent?: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/student/assignments/${id}/submit`, { fileUrl, textContent });
      return true;
    } catch {
      return true;
    }
  }
};
