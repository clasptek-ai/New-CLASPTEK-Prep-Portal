import { ExamType, SectionType } from '../../../services/admin/questions.service';

export interface LearnerIntelligenceProfile {
  studentId: string;
  studentName: string;
  targetExam: ExamType;
  targetScore: string; // e.g. "Band 7.5", "115 / 120", "1450 / 1600"
  currentScore: string; // e.g. "Band 6.5", "92 / 120", "1310 / 1600"
  practiceAccuracy: number;
  mockScores: { date: string; score: string; exam: ExamType }[];
  dailyStudyTimeMinutes: number;
  studyStreakDays: number;
  questionSpeedSeconds: number;
  weakSkills: Array<{ skill: string; section: SectionType; accuracy: number }>;
  strongSkills: Array<{ skill: string; section: SectionType; accuracy: number }>;
  confidenceTrend: 'UPWARD' | 'STABLE' | 'DECLINING';
  examDate: string;
  daysRemaining: number;
  learningPreferences: string[];
  lastUpdated: string;
}

export interface DailyStudyActivity {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  focus: string;
  activityType: 'PRACTICE' | 'MOCK' | 'VOCABULARY' | 'LESSON' | 'REST';
  targetQuestions: number;
  durationMinutes: number;
  completed: boolean;
}

export interface DynamicStudyPlan {
  id: string;
  exam: ExamType;
  targetScore: string;
  currentScore: string;
  daysRemaining: number;
  currentWeek: number;
  weeklyMilestone: string;
  schedule: DailyStudyActivity[];
  generatedAt: string;
}

export interface PredictiveReadinessModel {
  projectedScore: string; // e.g. "Band 7.0"
  confidenceLevelPercent: number; // e.g. 87%
  examReadinessPercent: number; // e.g. 78%
  estimatedDaysRemaining: number;
  probabilityOfAchievingTargetPercent: number; // e.g. 82%
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  topRecommendations: string[];
}

export interface MistakeAnalysisPattern {
  skill: string;
  section: SectionType;
  mistakeType: 'TIME_MANAGEMENT' | 'INFERENCE_ERROR' | 'VOCABULARY_GAP' | 'GRAMMAR_SYNTAX';
  occurrenceCount: number;
  averageTimeSpentSeconds: number;
  recommendation: string;
}

export interface AIRecommendationItem {
  id: string;
  type: 'PRACTICE' | 'MOCK' | 'RESOURCE' | 'VOCABULARY' | 'LESSON';
  title: string;
  targetSkill: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionUrl: string;
  description: string;
}

export interface AICoachMessage {
  id: string;
  sender: 'STUDENT' | 'COACH';
  text: string;
  timestamp: string;
  referencedData?: {
    exam?: ExamType;
    weakSkill?: string;
    projectedScore?: string;
  };
}

export const DEFAULT_LEARNER_PROFILE: LearnerIntelligenceProfile = {
  studentId: '',
  studentName: '',
  targetExam: 'IELTS Academic',
  targetScore: 'Band 7.5',
  currentScore: 'Band 6.5',
  practiceAccuracy: 76,
  mockScores: [
    { date: '2026-07-15', score: 'Band 6.0', exam: 'IELTS Academic' },
    { date: '2026-07-22', score: 'Band 6.5', exam: 'IELTS Academic' },
  ],
  dailyStudyTimeMinutes: 45,
  studyStreakDays: 12,
  questionSpeedSeconds: 52,
  weakSkills: [
    { skill: 'Matching Headings', section: 'Reading', accuracy: 42 },
    { skill: 'Integrated Task Synthesis', section: 'Writing', accuracy: 48 },
  ],
  strongSkills: [
    { skill: 'Subject-Verb Agreement', section: 'Grammar', accuracy: 92 },
    { skill: 'Main Idea Inferences', section: 'Reading', accuracy: 85 },
  ],
  confidenceTrend: 'UPWARD',
  examDate: '2026-09-10T00:00:00Z',
  daysRemaining: 43,
  learningPreferences: ['Visual Diagrams', 'Timed Practice', 'Interactive Coaching'],
  lastUpdated: new Date().toISOString(),
};
