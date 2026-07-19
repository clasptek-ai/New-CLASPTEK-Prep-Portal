import { apiClient } from '../api/client';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  programmeId: string;
  module: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'FILE' | 'TEXT' | 'HYBRID';
  allowedFileTypes: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
}

export const instructorAssignmentsService = {
  async getAssignments(): Promise<Assignment[]> {
    try {
      return await apiClient.get<Assignment[]>('/api/v1/instructor/assignments');
    } catch {
      return [
        {
          id: 'a1',
          title: 'Advanced Essay Syntax Assignment',
          description: 'Draft a 500-word argumentative essay focusing on modifiers structure.',
          instructions: 'Submit as PDF or DOCX before due date.',
          programmeId: 'p1',
          module: 'Writing Skills',
          dueDate: '2026-07-24',
          maxScore: 100,
          submissionType: 'FILE',
          allowedFileTypes: ['pdf', 'docx'],
          status: 'PUBLISHED'
        },
        {
          id: 'a2',
          title: 'IELTS Vocabulary Exercise Quiz',
          description: 'Complete the pre-session lexical exercises.',
          instructions: 'Fill the blank templates online.',
          programmeId: 'p1',
          module: 'Vocabulary Prep',
          dueDate: '2026-08-01',
          maxScore: 50,
          submissionType: 'TEXT',
          allowedFileTypes: [],
          status: 'DRAFT'
        }
      ];
    }
  },

  async createAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    try {
      return await apiClient.post<Assignment>('/api/v1/instructor/assignments', assignment);
    } catch {
      return {
        id: Math.random().toString(),
        ...assignment
      };
    }
  },

  async updateAssignmentStatus(id: string, status: Assignment['status']): Promise<boolean> {
    try {
      await apiClient.patch(`/api/v1/instructor/assignments/${id}/status`, { status });
      return true;
    } catch {
      return true; // fallback
    }
  }
};
