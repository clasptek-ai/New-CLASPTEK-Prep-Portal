export type ProgrammeId =
  | 'IELTS_ACADEMIC'
  | 'IELTS_GENERAL'
  | 'SAT'
  | 'TOEFL'
  | 'CELPIP';

export interface ProgrammeSkill {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  unit?: string;
  status: 'EXCELLENT' | 'STABLE' | 'NEEDS_WORK';
  trend: string;
}

export interface ProgrammeAIRecommendation {
  id: string;
  title: string;
  subtitle: string;
  category: 'Writing' | 'Reading' | 'Speaking' | 'Math' | 'Listening' | 'Verbal';
  estMinutes: number;
  skillId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProgrammeLesson {
  id: string;
  title: string;
  module: string;
  duration: string;
  completedPercent: number;
}

export type AcademicTestType = 'DIAGNOSTIC_ASSESSMENT' | 'FULL_MOCK_TEST' | 'SECTIONAL_PRACTICE';

export interface ProgrammeUpcomingTest {
  id: string;
  title: string;
  date: string;
  time: string;
  type: AcademicTestType;
  description: string;
}

export interface ProgrammeConfiguration {
  id: ProgrammeId;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    ringColor: string;
    badgeBg: string;
    badgeText: string;
  };
  targetMetric: {
    label: string;
    current: number | string;
    target: number | string;
    unit: string;
    description: string;
  };
  skills: ProgrammeSkill[];
  aiRecommendations: ProgrammeAIRecommendation[];
  recommendedLessons: ProgrammeLesson[];
  upcomingTests: ProgrammeUpcomingTest[];
}

export const PROGRAMME_CONFIGURATIONS: Record<ProgrammeId, ProgrammeConfiguration> = {
  IELTS_ACADEMIC: {
    id: 'IELTS_ACADEMIC',
    title: 'IELTS Academic Prep',
    subtitle: 'International English Language Testing System — Academic Module',
    badge: 'Target Band 8.0',
    iconName: 'BookOpen',
    colorPalette: {
      primary: '#2563eb', // Deep Academic Blue
      secondary: '#60a5fa',
      accent: '#1d4ed8',
      gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.05))',
      ringColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.15)',
      badgeText: '#60a5fa',
    },
    targetMetric: {
      label: 'Predicted Overall Band',
      current: 7.5,
      target: 8.0,
      unit: '/ 9.0',
      description: '0.5 Band away from target goal',
    },
    skills: [
      { id: 'ielts-ac-reading', name: 'Academic Reading', score: 8.5, maxScore: 9.0, status: 'EXCELLENT', trend: '+0.5 Band' },
      { id: 'ielts-ac-listening', name: 'Listening', score: 8.0, maxScore: 9.0, status: 'EXCELLENT', trend: 'Stable' },
      { id: 'ielts-ac-writing', name: 'Academic Writing Task 2', score: 6.5, maxScore: 9.0, status: 'NEEDS_WORK', trend: '+0.5 Band' },
      { id: 'ielts-ac-speaking', name: 'Speaking Part 3', score: 7.0, maxScore: 9.0, status: 'STABLE', trend: 'Stable' },
    ],
    aiRecommendations: [
      {
        id: 'rec-ac-1',
        title: 'Master Academic Writing Task 2 Coherence',
        subtitle: 'Focus on linking phrases and paragraph structure to lift Writing score to 7.5+',
        category: 'Writing',
        estMinutes: 20,
        skillId: 'ielts-ac-writing',
        priority: 'HIGH',
      },
      {
        id: 'rec-ac-2',
        title: 'Practice True/False/Not Given Speed Reading',
        subtitle: 'Refine keyword scanning techniques for Section 3 passages',
        category: 'Reading',
        estMinutes: 15,
        skillId: 'ielts-ac-reading',
        priority: 'MEDIUM',
      },
    ],
    recommendedLessons: [
      {
        id: 'l-ac-1',
        title: 'IELTS Academic Writing Task 2: Advanced Cohesion',
        module: 'Academic Writing Mastery',
        duration: '25 min',
        completedPercent: 65,
      },
      {
        id: 'l-ac-2',
        title: 'Listening Section 4: Academic Monologue Note-Taking',
        module: 'Advanced Listening Techniques',
        duration: '18 min',
        completedPercent: 40,
      },
    ],
    upcomingTests: [
      {
        id: 'diag-ac-1',
        title: 'Initial Proficiency Diagnostic',
        date: 'Today',
        time: 'Baseline',
        type: 'DIAGNOSTIC_ASSESSMENT',
        description: 'Determines initial skill baseline and generates personalized study plan',
      },
      {
        id: 'mock-ac-1',
        title: 'IELTS Academic Timed Full Mock #4',
        date: 'Tomorrow',
        time: '10:00 AM',
        type: 'FULL_MOCK_TEST',
        description: 'Simulates complete 2h 45m examination under strict timed rules',
      },
    ],
  },

  IELTS_GENERAL: {
    id: 'IELTS_GENERAL',
    title: 'IELTS General Training',
    subtitle: 'International English Language Testing System — General Training',
    badge: 'Target Band 8.0 (CLB 9)',
    iconName: 'Compass',
    colorPalette: {
      primary: '#0d9488', // Professional Teal
      secondary: '#2dd4bf',
      accent: '#0f766e',
      gradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.2), rgba(15, 118, 110, 0.05))',
      ringColor: '#0d9488',
      badgeBg: 'rgba(13, 148, 136, 0.15)',
      badgeText: '#2dd4bf',
    },
    targetMetric: {
      label: 'Predicted Overall Band',
      current: 7.5,
      target: 8.0,
      unit: '/ 9.0',
      description: 'Meets Express Entry CLB 9 threshold',
    },
    skills: [
      { id: 'ielts-gt-reading', name: 'General Reading', score: 8.0, maxScore: 9.0, status: 'EXCELLENT', trend: 'Stable' },
      { id: 'ielts-gt-listening', name: 'Listening', score: 8.5, maxScore: 9.0, status: 'EXCELLENT', trend: '+0.5 Band' },
      { id: 'ielts-gt-writing', name: 'Formal & Informal Letter Writing', score: 7.0, maxScore: 9.0, status: 'STABLE', trend: '+0.5 Band' },
      { id: 'ielts-gt-speaking', name: 'Speaking Interview', score: 7.5, maxScore: 9.0, status: 'STABLE', trend: 'Stable' },
    ],
    aiRecommendations: [
      {
        id: 'rec-gt-1',
        title: 'Master Formal Business Letter Writing',
        subtitle: 'Learn tone matching and opening/closing conventions for Task 1',
        category: 'Writing',
        estMinutes: 18,
        skillId: 'ielts-gt-writing',
        priority: 'HIGH',
      },
    ],
    recommendedLessons: [
      {
        id: 'l-gt-1',
        title: 'IELTS GT Task 1: Semi-Formal Complaint Letters',
        module: 'General Training Writing',
        duration: '20 min',
        completedPercent: 50,
      },
    ],
    upcomingTests: [
      {
        id: 'diag-gt-1',
        title: 'GT Baseline Diagnostic Assessment',
        date: 'Available Now',
        time: '30 min',
        type: 'DIAGNOSTIC_ASSESSMENT',
        description: 'Identifies proficiency gaps and sets letter writing learning path',
      },
      {
        id: 'mock-gt-1',
        title: 'IELTS GT Full Examination Simulation #2',
        date: 'Saturday',
        time: '02:00 PM',
        type: 'FULL_MOCK_TEST',
        description: 'Full timed simulation for Listening, Reading, and Writing',
      },
    ],
  },

  SAT: {
    id: 'SAT',
    title: 'SAT Digital Prep',
    subtitle: 'Scholastic Assessment Test for College Admissions',
    badge: 'Target 1520',
    iconName: 'Calculator',
    colorPalette: {
      primary: '#6366f1', // Modern Indigo
      secondary: '#818cf8',
      accent: '#4f46e5',
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.05))',
      ringColor: '#6366f1',
      badgeBg: 'rgba(99, 102, 241, 0.15)',
      badgeText: '#818cf8',
    },
    targetMetric: {
      label: 'Predicted Total Score',
      current: 1460,
      target: 1520,
      unit: '/ 1600',
      description: 'Top 2% score threshold',
    },
    skills: [
      { id: 'sat-math-alg', name: 'Advanced Algebra', score: 760, maxScore: 800, status: 'EXCELLENT', trend: '+20 pts' },
      { id: 'sat-math-geom', name: 'Geometry & Trig', score: 740, maxScore: 800, status: 'STABLE', trend: 'Stable' },
      { id: 'sat-reading-lit', name: 'Reading Passages', score: 680, maxScore: 800, status: 'NEEDS_WORK', trend: '+30 pts' },
      { id: 'sat-writing-gram', name: 'Grammar & Conventions', score: 720, maxScore: 800, status: 'STABLE', trend: '+10 pts' },
    ],
    aiRecommendations: [
      {
        id: 'rec-sat-1',
        title: 'Command of Evidence Reading Passages',
        subtitle: 'Identify text evidence pairs to close the 40-pt gap in Evidence-Based Reading',
        category: 'Reading',
        estMinutes: 25,
        skillId: 'sat-reading-lit',
        priority: 'HIGH',
      },
      {
        id: 'rec-sat-2',
        title: 'Desmos Calculator Tricks for Quadratic Systems',
        subtitle: 'Speed up Module 2 Math with graphing calculator techniques',
        category: 'Math',
        estMinutes: 15,
        skillId: 'sat-math-alg',
        priority: 'MEDIUM',
      },
    ],
    recommendedLessons: [
      {
        id: 'l-sat-1',
        title: 'SAT Reading: Craft & Structure Text Analysis',
        module: 'Reading & Writing Core',
        duration: '30 min',
        completedPercent: 80,
      },
    ],
    upcomingTests: [
      {
        id: 'diag-sat-1',
        title: 'SAT Digital Adaptive Diagnostic',
        date: 'Today',
        time: 'Initial Baseline',
        type: 'DIAGNOSTIC_ASSESSMENT',
        description: 'Routes adaptive module difficulty and tailors practice queue',
      },
      {
        id: 'mock-sat-1',
        title: 'SAT Digital Mock Examination #3',
        date: 'Saturday',
        time: '09:00 AM',
        type: 'FULL_MOCK_TEST',
        description: 'Full Bluebook-accurate digital SAT simulation',
      },
    ],
  },

  TOEFL: {
    id: 'TOEFL',
    title: 'TOEFL iBT Prep',
    subtitle: 'Test of English as a Foreign Language — Internet-Based Test',
    badge: 'Target 110',
    iconName: 'Headphones',
    colorPalette: {
      primary: '#0891b2', // Calm Cyan
      secondary: '#22d3ee',
      accent: '#0e7490',
      gradient: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(14, 116, 144, 0.05))',
      ringColor: '#0891b2',
      badgeBg: 'rgba(8, 145, 178, 0.15)',
      badgeText: '#22d3ee',
    },
    targetMetric: {
      label: 'Predicted Total Score',
      current: 104,
      target: 110,
      unit: '/ 120',
      description: 'Ivy League admission cutoff met',
    },
    skills: [
      { id: 'toefl-reading', name: 'Reading', score: 28, maxScore: 30, status: 'EXCELLENT', trend: '+1 pt' },
      { id: 'toefl-listening', name: 'Listening', score: 27, maxScore: 30, status: 'EXCELLENT', trend: 'Stable' },
      { id: 'toefl-speaking', name: 'Speaking Task 2-4', score: 23, maxScore: 30, status: 'NEEDS_WORK', trend: '+2 pts' },
      { id: 'toefl-writing', name: 'Writing Academic Discussion', score: 26, maxScore: 30, status: 'STABLE', trend: 'Stable' },
    ],
    aiRecommendations: [
      {
        id: 'rec-toefl-1',
        title: 'Integrated Speaking Intonation & Fluency Drill',
        subtitle: 'Practice summarizing lecture vs campus conversation within 60s limit',
        category: 'Speaking',
        estMinutes: 20,
        skillId: 'toefl-speaking',
        priority: 'HIGH',
      },
    ],
    recommendedLessons: [
      {
        id: 'l-toefl-1',
        title: 'TOEFL Speaking: Integrated Campus Task Templates',
        module: 'Speaking Excellence',
        duration: '22 min',
        completedPercent: 70,
      },
    ],
    upcomingTests: [
      {
        id: 'diag-toefl-1',
        title: 'TOEFL Initial Sectional Diagnostic',
        date: 'Completed',
        time: 'Baseline',
        type: 'DIAGNOSTIC_ASSESSMENT',
        description: 'Established baseline score of 104/120',
      },
      {
        id: 'mock-toefl-1',
        title: 'TOEFL iBT Full Simulation Exam',
        date: 'Next Monday',
        time: '11:00 AM',
        type: 'FULL_MOCK_TEST',
        description: 'Complete 2-hour TOEFL iBT examination simulation',
      },
    ],
  },

  CELPIP: {
    id: 'CELPIP',
    title: 'CELPIP General Prep',
    subtitle: 'Canadian English Language Proficiency Index Program',
    badge: 'Target Level 10+',
    iconName: 'Award',
    colorPalette: {
      primary: '#059669', // Professional Emerald
      secondary: '#34d399',
      accent: '#047857',
      gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(4, 120, 87, 0.05))',
      ringColor: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.15)',
      badgeText: '#34d399',
    },
    targetMetric: {
      label: 'Predicted CELPIP Level',
      current: 9,
      target: 10,
      unit: '/ 12',
      description: 'Permanent Residency (PR) maximum points threshold',
    },
    skills: [
      { id: 'celpip-listening', name: 'Listening Conversations', score: 10, maxScore: 12, status: 'EXCELLENT', trend: '+1 Level' },
      { id: 'celpip-reading', name: 'Reading Charts & Diagrams', score: 9, maxScore: 12, status: 'STABLE', trend: 'Stable' },
      { id: 'celpip-writing', name: 'Writing Email & Survey Responses', score: 8, maxScore: 12, status: 'NEEDS_WORK', trend: '+1 Level' },
      { id: 'celpip-speaking', name: 'Speaking Situation Tasks', score: 9, maxScore: 12, status: 'STABLE', trend: 'Stable' },
    ],
    aiRecommendations: [
      {
        id: 'rec-celpip-1',
        title: 'Expressing Opinions in CELPIP Survey Writing',
        subtitle: 'Structure persuasive arguments in Task 2 within the 150-200 word limit',
        category: 'Writing',
        estMinutes: 20,
        skillId: 'celpip-writing',
        priority: 'HIGH',
      },
    ],
    recommendedLessons: [
      {
        id: 'l-celpip-1',
        title: 'CELPIP Speaking Task 3: Describing a Scene',
        module: 'Canadian Speaking Fluency',
        duration: '15 min',
        completedPercent: 40,
      },
    ],
    upcomingTests: [
      {
        id: 'diag-celpip-1',
        title: 'CELPIP Diagnostic Assessment',
        date: 'Available',
        time: '45 min',
        type: 'DIAGNOSTIC_ASSESSMENT',
        description: 'Evaluates Canadian English proficiency across 4 skill areas',
      },
      {
        id: 'mock-celpip-1',
        title: 'CELPIP Full Mock Examination',
        date: 'Friday',
        time: '03:00 PM',
        type: 'FULL_MOCK_TEST',
        description: 'Complete 3-hour CELPIP General examination simulation',
      },
    ],
  },
};
