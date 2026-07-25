export enum OnboardingState {
  NOT_STARTED = 'NOT_STARTED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',
  PROGRAMME_SELECTED = 'PROGRAMME_SELECTED',
  DIAGNOSTIC_REQUIRED = 'DIAGNOSTIC_REQUIRED',
  DIAGNOSTIC_IN_PROGRESS = 'DIAGNOSTIC_IN_PROGRESS',
  DIAGNOSTIC_COMPLETED = 'DIAGNOSTIC_COMPLETED',
  LEARNING_PLAN_GENERATED = 'LEARNING_PLAN_GENERATED',
  ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED',
}

export interface StudentOnboardingData {
  state: OnboardingState;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  timeZone?: string;
  educationLevel?: string;
  intendedCountry?: string;
  intendedIntake?: string;
  purpose?: string;
  selectedExams: string[];
  targetExam: string;
  selectedProgramme: string;
  previousScore?: string;
  targetScore: string;
  plannedExamDate?: string;
  weeklyStudyHours?: number;
  diagnosticCompleted: boolean;
  baselineLevel?: string;
  estimatedBand?: string;
  gapAnalysis?: string;
}
