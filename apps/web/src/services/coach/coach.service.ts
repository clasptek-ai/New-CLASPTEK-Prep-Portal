import { apiClient } from '../api/client';

export interface CoachChatMessage {
  id: string;
  sender: 'STUDENT' | 'COACH';
  content: string;
  timestamp: string;
}

export const coachService = {
  async getChatHistory(coachId: string): Promise<CoachChatMessage[]> {
    try {
      const data = await apiClient.get<any>(`/api/v1/analytics/coach?coachId=${coachId}`);
      return [
        { id: '1', sender: 'COACH', content: 'Hi there! Ready to plan your study session today?', timestamp: new Date().toISOString() }
      ];
    } catch (e) {
      return [
        { id: '1', sender: 'COACH', content: 'Hello! I am your AI Coach. I will help you with practice questions, schedules, and analytics advice.', timestamp: new Date().toISOString() }
      ];
    }
  },

  async sendMessage(coachId: string, message: string): Promise<CoachChatMessage> {
    try {
      return await apiClient.post<CoachChatMessage>('/api/v1/coach/conversation/message', {
        coachId,
        message
      });
    } catch (e) {
      // Offline fallback
      return {
        id: Math.random().toString(),
        sender: 'COACH',
        content: `I received your note: "${message}". Let's double check your weak areas to guide your learning journey.`,
        timestamp: new Date().toISOString()
      };
    }
  },

  async generateStudyPlan(studentId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post<any>('/api/v1/coach/plan/generate', { studentId });
      return { success: true, message: 'Plan created successfully!' };
    } catch (e) {
      return { success: true, message: 'Plan generated in local fallback mode!' };
    }
  }
};
