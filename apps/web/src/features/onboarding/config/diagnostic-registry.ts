export interface DiagnosticDefinition {
  examType: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
  skillsEvaluated: string[];
  description: string;
  estimatedTimelineWeeks: number;
}

export const diagnosticRegistry: Record<string, DiagnosticDefinition> = {
  'English Proficiency': {
    examType: 'English Proficiency',
    title: 'English Proficiency Diagnostic Assessment',
    durationMinutes: 45,
    questionCount: 33,
    skillsEvaluated: [
      'Grammar, Reading & Writing',
    ],
    description:
      'Determines your English proficiency level and recommends the appropriate learning pathway.',
    estimatedTimelineWeeks: 8,
  },
  'IELTS Academic': {
    examType: 'IELTS Academic',
    title: 'IELTS Academic Diagnostic',
    durationMinutes: 25,
    questionCount: 30,
    skillsEvaluated: [
      'Academic Reading',
      'Listening Comprehension',
      'Writing Task 2 Logic',
      'Grammatical Accuracy',
    ],
    description:
      'Evaluates your current academic readiness to begin an official IELTS 9-band preparation programme.',
    estimatedTimelineWeeks: 8,
  },
  'IELTS General Training': {
    examType: 'IELTS General Training',
    title: 'IELTS General Training Diagnostic',
    durationMinutes: 25,
    questionCount: 30,
    skillsEvaluated: [
      'General Reading',
      'Listening Comprehension',
      'Letter Writing Format',
      'Grammatical Accuracy',
    ],
    description: 'Measures workplace and immigration English communication readiness.',
    estimatedTimelineWeeks: 6,
  },
  'TOEFL iBT': {
    examType: 'TOEFL iBT',
    title: 'TOEFL iBT Diagnostic',
    durationMinutes: 35,
    questionCount: 35,
    skillsEvaluated: [
      'Integrated Reading',
      'Academic Listening',
      'Speaking Delivery',
      'Writing Structure',
    ],
    description: 'Evaluates academic readiness on the TOEFL preparation pathway.',
    estimatedTimelineWeeks: 10,
  },
  SAT: {
    examType: 'SAT',
    title: 'Digital SAT Diagnostic',
    durationMinutes: 45,
    questionCount: 40,
    skillsEvaluated: [
      'Reading & Writing Inferences',
      'Algebra & Advanced Math',
      'Problem Solving',
      'Data Analysis',
    ],
    description:
      'Assesses digital SAT readiness across Math and Evidence-Based Reading & Writing.',
    estimatedTimelineWeeks: 12,
  },
  CELPIP: {
    examType: 'CELPIP',
    title: 'CELPIP General Diagnostic',
    durationMinutes: 30,
    questionCount: 32,
    skillsEvaluated: [
      'Canadian Reading',
      'Listening in Context',
      'Workplace Writing',
      'Interactive Speaking',
    ],
    description:
      'Evaluates functional language ability for Canadian permanent residency preparation.',
    estimatedTimelineWeeks: 6,
  },
};

export function getDiagnosticDefinition(examType?: string): DiagnosticDefinition {
  if (examType && diagnosticRegistry[examType]) {
    return diagnosticRegistry[examType];
  }
  return diagnosticRegistry['English Proficiency'];
}
