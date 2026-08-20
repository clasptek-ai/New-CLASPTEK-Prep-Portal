import {
  ExamType,
  SectionType,
  QuestionType,
  DifficultyLevel,
  AdminQuestion,
} from '../../../services/admin/questions.service';
import { BandScoreResult } from '../../../services/student/practice.service';

export interface QuestionGroupBlueprint {
  id: string;
  groupTitle: string; // e.g. "Questions 1-5: Matching Headings"
  questionType: QuestionType;
  questionCount: number;
  instructions: string;
  passageRequired?: boolean;
}

export interface MockBlueprintSection {
  id: string;
  name: SectionType;
  questionTypes: QuestionType[];
  questionGroups?: QuestionGroupBlueprint[];
  questionCount: number;
  timeLimitMinutes: number;
  passingScorePercent: number;
  difficultyDistribution: Partial<Record<DifficultyLevel, number>>; // e.g. { EASY: 20, MEDIUM: 50, HARD: 30 }
  instructions: string;
}

export interface MockBlueprint {
  id: string;
  code: string;
  exam: ExamType;
  title: string;
  version: string;
  sections: MockBlueprintSection[];
  totalQuestions: number;
  totalTimeMinutes: number;
  scoringMethod: 'BAND_SCALE_CONVERSION' | 'RAW_PERCENTAGE' | 'POINTS_ACCUMULATION';
  allowPause: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface MockTemplate {
  id: string;
  code: string;
  blueprintId: string;
  exam: ExamType;
  title: string;
  version: string;
  sections: Array<{
    sectionName: SectionType;
    timeLimitMinutes: number;
    questions: AdminQuestion[];
  }>;
  totalQuestions: number;
  totalDurationMinutes: number;
  createdAt: string;
}

export interface MockSessionAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  scoreEarned: number;
  timeSpentSeconds: number;
  confidenceRating?: 'HIGH' | 'MEDIUM' | 'LOW';
  bookmarked?: boolean;
}

export interface MockSession {
  id: string;
  templateId: string;
  blueprintId: string;
  exam: ExamType;
  studentId: string;
  status: 'IN_PROGRESS' | 'PAUSED' | 'SUBMITTED' | 'EXPIRED';
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  answers: Record<string, MockSessionAnswer>;
  template?: MockTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface MockResult {
  id: string;
  sessionId: string;
  exam: ExamType;
  studentId: string;
  rawScore: number;
  totalQuestions: number;
  sectionScores: Record<SectionType, { rawScore: number; total: number; percentage: number }>;
  scoreResult: BandScoreResult;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface MockIntegrityLog {
  id: string;
  sessionId: string;
  studentName: string;
  eventType: 'TAB_SWITCH' | 'FOCUS_LOST' | 'PAUSE_REQUEST' | 'TIME_EXPIRED';
  timestamp: string;
  details: string;
}

export const DEFAULT_MOCK_BLUEPRINTS: MockBlueprint[] = [
  {
    id: 'bp-ielts-acad',
    code: 'BP-IELTS-AC-2026',
    exam: 'IELTS Academic',
    title: 'Official IELTS Academic 4-Section Mock Blueprint',
    version: 'v4.2',
    scoringMethod: 'BAND_SCALE_CONVERSION',
    allowPause: false,
    status: 'ACTIVE',
    totalQuestions: 40,
    totalTimeMinutes: 165,
    createdAt: '2026-06-01T10:00:00Z',
    sections: [
      {
        id: 'sec-ielts-rd',
        name: 'Reading',
        questionTypes: ['MCQ', 'TRUE_FALSE_NOT_GIVEN', 'MATCHING', 'FILL_IN_BLANK'],
        questionCount: 40,
        timeLimitMinutes: 60,
        passingScorePercent: 60,
        difficultyDistribution: { EASY: 25, MEDIUM: 50, HARD: 25 },
        instructions: 'Read 3 academic passages and answer 40 questions in 60 minutes.',
      },
      {
        id: 'sec-ielts-wr',
        name: 'Writing',
        questionTypes: ['ESSAY'],
        questionCount: 2,
        timeLimitMinutes: 60,
        passingScorePercent: 65,
        difficultyDistribution: { EASY: 0, MEDIUM: 50, HARD: 50 },
        instructions: 'Complete Task 1 (150 words) and Task 2 Essay (250 words).',
      },
    ],
  },
  {
    id: 'bp-toefl-ibt',
    code: 'BP-TOEFL-IBT-2026',
    exam: 'TOEFL iBT',
    title: 'Official ETS TOEFL iBT Internet-Based Test Blueprint',
    version: 'v3.0',
    scoringMethod: 'BAND_SCALE_CONVERSION',
    allowPause: true,
    status: 'ACTIVE',
    totalQuestions: 35,
    totalTimeMinutes: 116,
    createdAt: '2026-06-10T12:00:00Z',
    sections: [
      {
        id: 'sec-toefl-rd',
        name: 'Reading',
        questionTypes: ['MCQ', 'FILL_IN_BLANK'],
        questionCount: 20,
        timeLimitMinutes: 35,
        passingScorePercent: 65,
        difficultyDistribution: { EASY: 20, MEDIUM: 60, HARD: 20 },
        instructions: 'Read 2 academic passages and answer 20 questions in 35 minutes.',
      },
      {
        id: 'sec-toefl-wr',
        name: 'Writing',
        questionTypes: ['ESSAY'],
        questionCount: 2,
        timeLimitMinutes: 29,
        passingScorePercent: 70,
        difficultyDistribution: { EASY: 0, MEDIUM: 50, HARD: 50 },
        instructions: 'Write Integrated Response and Academic Discussion Response.',
      },
    ],
  },
  {
    id: 'bp-sat-digital',
    code: 'BP-SAT-DIG-2026',
    exam: 'SAT',
    title: 'Official Digital SAT Reading & Math Blueprint',
    version: 'v2.1',
    scoringMethod: 'BAND_SCALE_CONVERSION',
    allowPause: false,
    status: 'ACTIVE',
    totalQuestions: 49,
    totalTimeMinutes: 134,
    createdAt: '2026-06-15T09:00:00Z',
    sections: [
      {
        id: 'sec-sat-rw1',
        name: 'Reading',
        questionTypes: ['MCQ', 'FILL_IN_BLANK'],
        questionCount: 27,
        timeLimitMinutes: 32,
        passingScorePercent: 70,
        difficultyDistribution: { EASY: 30, MEDIUM: 40, HARD: 30 },
        instructions: 'Module 1: Reading and Writing short context items.',
      },
      {
        id: 'sec-sat-mth1',
        name: 'Math',
        questionTypes: ['MCQ', 'FILL_IN_BLANK'],
        questionCount: 22,
        timeLimitMinutes: 35,
        passingScorePercent: 70,
        difficultyDistribution: { EASY: 25, MEDIUM: 50, HARD: 25 },
        instructions: 'Module 1: Math with built-in graphing calculator.',
      },
    ],
  },
  {
    id: 'bp-celpip-gen',
    code: 'BP-CELPIP-GEN-2026',
    exam: 'CELPIP',
    title: 'Official Paragon CELPIP General Blueprint',
    version: 'v1.0',
    scoringMethod: 'BAND_SCALE_CONVERSION',
    allowPause: false,
    status: 'ACTIVE',
    totalQuestions: 38,
    totalTimeMinutes: 180,
    createdAt: '2026-06-20T11:00:00Z',
    sections: [
      {
        id: 'sec-celpip-rd',
        name: 'Reading',
        questionTypes: ['MCQ', 'MATCHING'],
        questionCount: 38,
        timeLimitMinutes: 55,
        passingScorePercent: 60,
        difficultyDistribution: { EASY: 30, MEDIUM: 50, HARD: 20 },
        instructions: 'Functional reading for Canadian residency requirements.',
      },
    ],
  },
];
