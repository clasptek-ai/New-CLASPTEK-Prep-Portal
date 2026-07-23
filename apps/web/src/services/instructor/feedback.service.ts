import { apiClient } from '../api/client';

export interface InstructorNoteItem {
  id: string;
  studentId: string;
  instructorId: string;
  instructorName: string;
  timestamp: string;
  category: 'ACADEMIC' | 'ASSIGNMENT' | 'MOCK' | 'GENERAL';
  visibility: 'PUBLIC' | 'ADMIN_ONLY'; // PUBLIC = Student & Admin, ADMIN_ONLY = Admin Only
  content: string;
}

export const instructorFeedbackService = {
  async getNotes(studentId: string): Promise<InstructorNoteItem[]> {
    try {
      return await apiClient.get<InstructorNoteItem[]>(
        `/api/v1/instructor/notes?studentId=${studentId}`
      );
    } catch {
      return [
        {
          id: 'note1',
          studentId,
          instructorId: 'inst-456',
          instructorName: 'Sarah Jenkins',
          timestamp: '2026-07-15T10:30:00Z',
          category: 'ACADEMIC',
          visibility: 'PUBLIC',
          content:
            'Grammar active modifier modifiers structure is improving, but still needs practice.',
        },
      ];
    }
  },

  async addNote(
    note: Omit<InstructorNoteItem, 'id' | 'timestamp' | 'instructorId' | 'instructorName'>
  ): Promise<InstructorNoteItem> {
    try {
      return await apiClient.post<InstructorNoteItem>('/api/v1/instructor/notes', note);
    } catch {
      return {
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        instructorId: 'inst-456',
        instructorName: 'Sarah Jenkins',
        ...note,
      };
    }
  },
};
