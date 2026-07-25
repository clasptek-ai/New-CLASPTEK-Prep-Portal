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
  'IELTS Academic': {
    examType: 'IELTS Academic',
    title: 'IELTS Academic Placement Diagnostic',
    durationMinutes: 25,
    questionCount: 30,
    skillsEvaluated: [
      'Academic Reading',
      'Listening Comprehension',
      'Writing Task 2 Logic',
      'Grammatical Accuracy',
    ],
    description:
      'Evaluates your current academic English proficiency against official IELTS 9-band scale standards.',
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
    title: 'TOEFL iBT Proficiency Diagnostic',
    durationMinutes: 35,
    questionCount: 35,
    skillsEvaluated: [
      'Integrated Reading',
      'Academic Listening',
      'Speaking Delivery',
      'Writing Structure',
    ],
    description: 'Evaluates academic university entrance readiness on the 120-point TOEFL scale.',
    estimatedTimelineWeeks: 10,
  },
  SAT: {
    examType: 'SAT',
    title: 'SAT Digital Assessment Diagnostic',
    durationMinutes: 45,
    questionCount: 40,
    skillsEvaluated: [
      'Reading & Writing Inferences',
      'Algebra & Advanced Math',
      'Problem Solving',
      'Data Analysis',
    ],
    description:
      'Assesses digital SAT performance across Math and Evidence-Based Reading & Writing.',
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
      'Evaluates functional language ability for Canadian permanent residency and citizenship.',
    estimatedTimelineWeeks: 6,
  },
  'PTE Academic': {
    examType: 'PTE Academic',
    title: 'PTE Academic Computer Diagnostic',
    durationMinutes: 30,
    questionCount: 35,
    skillsEvaluated: [
      'Speaking & Writing Combo',
      'Reading Fill-in-Blanks',
      'Summarize Spoken Text',
      'Vocabulary',
    ],
    description: 'Evaluates automated AI-scanned PTE test readiness.',
    estimatedTimelineWeeks: 8,
  },
  'Duolingo English Test': {
    examType: 'Duolingo English Test',
    title: 'Duolingo English Test Diagnostic',
    durationMinutes: 20,
    questionCount: 25,
    skillsEvaluated: ['Literacy', 'Comprehension', 'Conversation', 'Production'],
    description: 'Measures subscore performance on the 160-point Duolingo adaptive scale.',
    estimatedTimelineWeeks: 4,
  },
};

export function getDiagnosticDefinition(examType?: string): DiagnosticDefinition {
  if (examType && diagnosticRegistry[examType]) {
    return diagnosticRegistry[examType];
  }
  return diagnosticRegistry['IELTS Academic'];
}
