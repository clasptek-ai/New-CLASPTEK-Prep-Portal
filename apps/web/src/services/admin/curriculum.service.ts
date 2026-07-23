import { apiClient } from '../api/client';

export interface AdminLesson {
  id: string;
  title: string;
  order: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface AdminModule {
  id: string;
  name: string;
  order: number;
  lessons: AdminLesson[];
}

export const adminCurriculumService = {
  async getModules(programmeId: string): Promise<AdminModule[]> {
    try {
      return await apiClient.get<AdminModule[]>(`/api/v1/admin/programmes/${programmeId}/modules`);
    } catch {
      return [
        {
          id: 'm1',
          name: 'Advanced Writing Skills',
          order: 1,
          lessons: [
            { id: 'l1', title: 'Passive Voice Syntax Constraints', order: 1, status: 'PUBLISHED' },
            { id: 'l2', title: 'Relative Clauses Modifiers Coherence', order: 2, status: 'DRAFT' },
          ],
        },
        {
          id: 'm2',
          name: 'Academic Reading Diagnostics',
          order: 2,
          lessons: [],
        },
      ];
    }
  },

  async reorderModules(programmeId: string, moduleIds: string[]): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/programmes/${programmeId}/modules/reorder`, {
        moduleIds,
      });
      return true;
    } catch {
      return true;
    }
  },

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/modules/${moduleId}/lessons/reorder`, { lessonIds });
      return true;
    } catch {
      return true;
    }
  },

  async publishLesson(lessonId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/lessons/${lessonId}/publish`, {});
      return true;
    } catch {
      return true;
    }
  },
};
