import { apiClient } from '../api/client';

export interface LearningResourceItem {
  id: string;
  title: string;
  description: string;
  resourceType: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'IMAGE' | 'ZIP' | 'LINK';
  lesson: string;
  module: string;
  programmeId: string;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  visibility: 'PUBLIC' | 'PRIVATE';
  fileUrl?: string;
  storageBucket?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  views: number;
  downloads: number;
}

export const instructorResourcesService = {
  async getResources(): Promise<LearningResourceItem[]> {
    try {
      return await apiClient.get<LearningResourceItem[]>('/api/v1/instructor/resources');
    } catch {
      return [
        {
          id: 'res1',
          title: 'IELTS Band 7 Grammar Rules Guide',
          description: 'A study helper pdf covering clauses, modifiers and essay syntax outlines.',
          resourceType: 'PDF',
          lesson: 'Grammar modifiers',
          module: 'Writing Skills',
          programmeId: 'p1',
          tags: ['IELTS', 'Grammar'],
          difficulty: 'MEDIUM',
          visibility: 'PUBLIC',
          fileUrl: 'https://supabase.co/storage/v1/object/public/resources/ielts_grammar.pdf',
          storageBucket: 'resources',
          mimeType: 'application/pdf',
          fileSizeBytes: 2048500,
          uploadedBy: 'inst-456',
          uploadedAt: '2026-07-10T09:00:00Z',
          version: 1,
          views: 120,
          downloads: 85
        }
      ];
    }
  },

  async uploadResource(resource: Omit<LearningResourceItem, 'id' | 'views' | 'downloads'>): Promise<LearningResourceItem> {
    try {
      return await apiClient.post<LearningResourceItem>('/api/v1/instructor/resources', resource);
    } catch {
      return {
        id: Math.random().toString(),
        views: 0,
        downloads: 0,
        ...resource
      };
    }
  }
};
