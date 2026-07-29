import { learningIntelligenceService } from './learning-intelligence.service';
import { AICoachMessage } from '../domain/learner-intelligence-profile';

export const aiCoachService = {
  async askCoach(userText: string): Promise<AICoachMessage> {
    const profile = await learningIntelligenceService.getProfile();
    const readiness = await learningIntelligenceService.getPredictiveReadiness();
    const query = userText.toLowerCase();

    let responseText = '';

    if (
      query.includes('reading') &&
      (query.includes('drop') || query.includes('low') || query.includes('why'))
    ) {
      responseText = `Based on your recent performance data for **${profile.targetExam}**, your Reading accuracy is currently at **${profile.weakSkills[0]?.accuracy || 42}%**—specifically in **${profile.weakSkills[0]?.skill || 'Matching Headings'}**.\n\nYour reading speed averages 52s per item. The main bottleneck is spending too long analyzing details instead of skimming for main paragraph stances first.\n\n**Coaching Recommendation:** Complete 15 target practice items in Matching Headings today. Focus on sentence 1 and sentence 3 of each paragraph first.`;
    } else if (
      query.includes('study today') ||
      query.includes('what should i do') ||
      query.includes('today')
    ) {
      responseText = `Here is your personalized study plan for today (${new Date().toLocaleDateString('en-US', { weekday: 'long' })}):\n\n1. **Target Practice (40 mins):** 15 items in **${profile.weakSkills[0]?.skill || 'Matching Headings'}**.\n2. **Vocabulary Review (20 mins):** Academic Collocations for Task 2 Writing.\n3. **Goal:** Maintain your **${profile.studyStreakDays}-day study streak**!\n\nYour projected score is currently **${readiness.projectedScore}** (${readiness.confidenceLevelPercent}% confidence).`;
    } else if (query.includes('improve') || query.includes('band') || query.includes('target')) {
      responseText = `To move from your current **${profile.currentScore}** to your target **${profile.targetScore}** for **${profile.targetExam}** with ${profile.daysRemaining} days remaining:\n\n1. **Academic Reading:** Bridge the gap in ${profile.weakSkills[0]?.skill} (currently ${profile.weakSkills[0]?.accuracy}% accuracy).\n2. **Writing Task 2:** Implement 4-paragraph structured response templates with clear cohesive devices.\n3. **Mock Exam:** Take a full timed simulation this weekend to validate your Band 7.5 readiness.`;
    } else if (query.includes('sat') || query.includes('module 2') || query.includes('math')) {
      responseText = `In your recent SAT Math simulation, errors occurred in **Quadratic Equations** during Module 2 due to time pressure (averaged 82s per hard math item).\n\n**Strategy:** For non-linear system equations, plug options back into the quadratic equation \\(f(x) = g(x)\\) to save 30 seconds per item.`;
    } else {
      responseText = `I have analyzed your **${profile.targetExam}** profile (${profile.daysRemaining} days until exam). Your practice accuracy is **${profile.practiceAccuracy}%** and projected score is **${readiness.projectedScore}**.\n\nHow can I help coach you today on **${profile.weakSkills[0]?.skill || 'Reading'}** or your **${profile.targetScore}** milestone?`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'COACH',
      text: responseText,
      timestamp: new Date().toISOString(),
      referencedData: {
        exam: profile.targetExam,
        weakSkill: profile.weakSkills[0]?.skill,
        projectedScore: readiness.projectedScore,
      },
    };
  },

  async getChatHistory(): Promise<AICoachMessage[]> {
    const profile = await learningIntelligenceService.getProfile();
    return [
      {
        id: 'msg-init',
        sender: 'COACH',
        text: `Welcome back, ${profile.studentName}! I am your AI Exam Coach for **${profile.targetExam}**.\n\nYour current readiness is **${profile.currentScore}** with a projected target of **${profile.targetScore}** (${profile.daysRemaining} days remaining).\n\nAsk me anything about your weak skills, practice strategy, or daily study plan!`,
        timestamp: new Date().toISOString(),
      },
    ];
  },
};
