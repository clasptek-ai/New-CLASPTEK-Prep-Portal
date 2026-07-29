import {
  LearnerIntelligenceProfile,
  DynamicStudyPlan,
  PredictiveReadinessModel,
  AIRecommendationItem,
  DEFAULT_LEARNER_PROFILE,
} from '../domain/learner-intelligence-profile';

const PROFILE_STORAGE_KEY = 'clasptek_ai_learner_profile';
const STUDY_PLAN_STORAGE_KEY = 'clasptek_ai_study_plan';

function getStoredProfile(): LearnerIntelligenceProfile {
  if (typeof window === 'undefined') return DEFAULT_LEARNER_PROFILE;
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_LEARNER_PROFILE));
    return DEFAULT_LEARNER_PROFILE;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LEARNER_PROFILE;
  }
}

function saveProfile(profile: LearnerIntelligenceProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export const learningIntelligenceService = {
  async getProfile(): Promise<LearnerIntelligenceProfile> {
    return getStoredProfile();
  },

  async getPredictiveReadiness(): Promise<PredictiveReadinessModel> {
    const profile = getStoredProfile();
    const isCloseToExam = profile.daysRemaining < 30;

    return {
      projectedScore: profile.currentScore === 'Band 6.5' ? 'Band 7.0' : 'Band 7.5',
      confidenceLevelPercent: 87,
      examReadinessPercent: profile.practiceAccuracy >= 75 ? 82 : 68,
      estimatedDaysRemaining: profile.daysRemaining,
      probabilityOfAchievingTargetPercent: 84,
      riskLevel: isCloseToExam && profile.practiceAccuracy < 70 ? 'HIGH' : 'LOW',
      topRecommendations: [
        'Complete 2 target practice sets in Matching Headings (Reading)',
        'Review Integrated Writing structure for Task 2',
        'Take full timed Mock Examination this weekend',
      ],
    };
  },

  async getDynamicStudyPlan(): Promise<DynamicStudyPlan> {
    const profile = getStoredProfile();

    return {
      id: 'plan-dyn-01',
      exam: profile.targetExam,
      targetScore: profile.targetScore,
      currentScore: profile.currentScore,
      daysRemaining: profile.daysRemaining,
      currentWeek: 1,
      weeklyMilestone: 'Master Academic Reading Matching Headings & Boost Accuracy to 80%',
      generatedAt: new Date().toISOString(),
      schedule: [
        {
          day: 'Monday',
          focus: 'Reading Passage 1: Matching Headings',
          activityType: 'PRACTICE',
          targetQuestions: 15,
          durationMinutes: 45,
          completed: true,
        },
        {
          day: 'Tuesday',
          focus: 'Writing Task 2: Sentence Structure & Cohesion',
          activityType: 'LESSON',
          targetQuestions: 5,
          durationMinutes: 30,
          completed: true,
        },
        {
          day: 'Wednesday',
          focus: 'Academic Vocabulary Building & Phrase Bank',
          activityType: 'VOCABULARY',
          targetQuestions: 20,
          durationMinutes: 25,
          completed: false,
        },
        {
          day: 'Thursday',
          focus: 'Target Weakness: Matching Headings & True/False/Not Given',
          activityType: 'PRACTICE',
          targetQuestions: 15,
          durationMinutes: 40,
          completed: false,
        },
        {
          day: 'Friday',
          focus: 'Active Rest Day & Vocabulary Flashcards Review',
          activityType: 'REST',
          targetQuestions: 0,
          durationMinutes: 15,
          completed: false,
        },
        {
          day: 'Saturday',
          focus: 'Official Full-Length Timed Mock Examination',
          activityType: 'MOCK',
          targetQuestions: 40,
          durationMinutes: 165,
          completed: false,
        },
        {
          day: 'Sunday',
          focus: 'Mock Result Rationale Review & Weak Spot Analysis',
          activityType: 'LESSON',
          targetQuestions: 0,
          durationMinutes: 45,
          completed: false,
        },
      ],
    };
  },

  async getRecommendations(): Promise<AIRecommendationItem[]> {
    return [
      {
        id: 'rec-01',
        type: 'PRACTICE',
        title: 'Target Practice: Matching Headings',
        targetSkill: 'Matching Headings',
        priority: 'HIGH',
        actionUrl: '/practice?skill=Matching+Headings',
        description:
          'Your accuracy in this skill is 42%. Completing 15 items will boost confidence.',
      },
      {
        id: 'rec-02',
        type: 'MOCK',
        title: 'Official IELTS Academic Full Mock Set 2',
        targetSkill: 'All Sections',
        priority: 'HIGH',
        actionUrl: '/student/mock',
        description: 'Simulate official exam conditions to test your readiness projection.',
      },
      {
        id: 'rec-03',
        type: 'VOCABULARY',
        title: 'Academic Collocations & Cohesive Devices',
        targetSkill: 'Writing & Speaking',
        priority: 'MEDIUM',
        actionUrl: '/learning',
        description: 'Key Band 7.5 transition phrases for Task 1 & Task 2 essays.',
      },
    ];
  },

  async updateProfileAfterSession(
    exam: string,
    scorePercent: number,
    weakSkill?: string
  ): Promise<LearnerIntelligenceProfile> {
    const profile = getStoredProfile();
    profile.practiceAccuracy = Math.round((profile.practiceAccuracy + scorePercent) / 2);
    profile.dailyStudyTimeMinutes += 20;
    profile.lastUpdated = new Date().toISOString();

    if (weakSkill) {
      const existing = profile.weakSkills.find((w) => w.skill === weakSkill);
      if (existing) {
        existing.accuracy = scorePercent;
      }
    }

    saveProfile(profile);
    return profile;
  },
};
