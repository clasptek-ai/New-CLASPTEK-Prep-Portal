import { apiClient } from '../api/client';

export interface AuthoringProgramme {
  id: string;
  name: string;
  code: string;
  coursesCount: number;
  status: 'DRAFT' | 'PUBLISHED';
  version: number;
}

export const authoringCurriculumService = {
  async getProgrammes(): Promise<AuthoringProgramme[]> {
    try {
      return await apiClient.get<AuthoringProgramme[]>('/api/v1/curricula');
    } catch (e) {
      return [
        { id: 'p1', name: 'Intensive English Grammar Prep', code: 'IEGP-01', coursesCount: 5, status: 'PUBLISHED', version: 3 },
        { id: 'p2', name: 'University Academic Writing Standard', code: 'UAWS-02', coursesCount: 3, status: 'DRAFT', version: 1 }
      ];
    }
  },

  async getProgramme(id: string): Promise<AuthoringProgramme> {
    try {
      return await apiClient.get<AuthoringProgramme>(`/api/v1/curricula/${id}`);
    } catch (e) {
      const all = await this.getProgrammes();
      return all.find(item => item.id === id) || all[0];
    }
  }
};
