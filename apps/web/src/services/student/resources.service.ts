import { apiClient } from '../api/client';

export interface StudentResource {
  id: string;
  title: string;
  description: string;
  resourceType: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'IMAGE' | 'LINK';
  lesson: string;
  module: string;
  tags: string[];
  downloadsCount: number;
  lastUpdated: string;
  bookmarked: boolean;
}

export const studentResourcesService = {
  async getResources(): Promise<StudentResource[]> {
    try {
      return await apiClient.get<StudentResource[]>('/api/v1/student/resources');
    } catch {
      return [
        {
          id: 'res1',
          title: 'IELTS Band 7 Grammar Rules Guide',
          description: 'A study helper pdf covering clauses, modifiers and essay syntax outlines.',
          resourceType: 'PDF',
          lesson: 'Passive Voice Syntax Constraints',
          module: 'Advanced Writing Skills',
          tags: ['IELTS', 'Grammar'],
          downloadsCount: 120,
          lastUpdated: '2026-07-10T09:00:00Z',
          bookmarked: true
        },
        {
          id: 'res2',
          title: 'Skimming and Scanning Strategies Video',
          description: 'Overview tutorial on scanning academic texts under time constraints.',
          resourceType: 'VIDEO',
          lesson: 'Skimming and Scanning Strategies',
          module: 'Academic Reading Diagnostics',
          tags: ['Reading', 'Skimming'],
          downloadsCount: 45,
          lastUpdated: '2026-07-14T11:00:00Z',
          bookmarked: false
        }
      ];
    }
  },

  async toggleBookmark(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/student/resources/${id}/bookmark`, {});
      return true;
    } catch {
      return true;
    }
  }
};
