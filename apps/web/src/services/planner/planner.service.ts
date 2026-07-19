import { apiClient } from '../api/client';

export interface PlannerTask {
  id: string;
  title: string;
  duration: number; // minutes
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
}

export const plannerService = {
  async getTasks(): Promise<PlannerTask[]> {
    try {
      return await apiClient.get<PlannerTask[]>('/api/v1/student/journey/tasks');
    } catch (e) {
      return [
        { id: 't1', title: 'Complete Practice recommendation session', duration: 20, priority: 'HIGH', completed: true },
        { id: 't2', title: 'Read Advanced vocabulary PDF resources', duration: 15, priority: 'MEDIUM', completed: false },
        { id: 't3', title: 'Answer dynamic review checklist questions', duration: 10, priority: 'LOW', completed: false }
      ];
    }
  },

  async toggleTask(taskId: string, completed: boolean): Promise<boolean> {
    try {
      await apiClient.patch<any>(`/api/v1/student/journey/tasks/${taskId}`, { completed });
      return true;
    } catch (e) {
      return true; // Local update mock
    }
  }
};
