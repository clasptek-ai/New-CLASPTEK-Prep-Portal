import { coachService, CoachChatMessage } from '../coach/coach.service';
import { getDeterministicId } from '../../lib/mock-util';

export { type CoachChatMessage };

export const studentCoachService = {
  async getChatHistory(): Promise<CoachChatMessage[]> {
    return await coachService.getChatHistory('student-active-coach');
  },

  async sendMessage(message: string): Promise<CoachChatMessage> {
    return await coachService.sendMessage('student-active-coach', message);
  },

  async triggerPlanGeneration(): Promise<{ success: boolean; message: string }> {
    const studentId = (typeof window !== 'undefined' ? localStorage.getItem('active-student-id') : null) || getDeterministicId('default-student');
    return await coachService.generateStudyPlan(studentId);
  }
};
