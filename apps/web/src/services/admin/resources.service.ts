import { apiClient } from '../api/client';

export interface AdminResource {
  id: string;
  title: string;
  category: string;
  downloadsCount: number;
  type: 'PDF' | 'VIDEO' | 'PPTX' | 'LINK';
  status: 'ACTIVE' | 'ARCHIVED';
}

export const adminResourcesService = {
  async getResources(): Promise<AdminResource[]> {
    try {
      return await apiClient.get<AdminResource[]>('/api/v1/admin/resources');
    } catch {
      return [
        {
          id: 'res1',
          title: 'IELTS Band 7 Grammar Rules Guide',
          category: 'Grammar',
          downloadsCount: 120,
          type: 'PDF',
          status: 'ACTIVE',
        },
        {
          id: 'res2',
          title: 'Skimming and Scanning Strategies Video',
          category: 'Reading',
          downloadsCount: 45,
          type: 'VIDEO',
          status: 'ACTIVE',
        },
      ];
    }
  },

  async uploadResource(
    data: Omit<AdminResource, 'id' | 'downloadsCount' | 'status'>
  ): Promise<AdminResource> {
    try {
      return await apiClient.post<AdminResource>('/api/v1/admin/resources', data);
    } catch {
      return {
        id: 'res-' + Math.random().toString(),
        downloadsCount: 0,
        status: 'ACTIVE',
        ...data,
      };
    }
  },

  async archiveResource(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/resources/${id}/archive`, {});
      return true;
    } catch {
      return true;
    }
  },
};
