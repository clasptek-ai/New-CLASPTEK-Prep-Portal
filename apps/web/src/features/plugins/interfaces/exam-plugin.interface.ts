import { ExamType, SectionType } from '../../../services/admin/questions.service';

export interface ScoreConversionResult {
  exam: ExamType;
  rawScore: number;
  totalQuestions: number;
  bandOrScale: string;
  overallScore: number | string;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  sectionBreakdown: Record<string, number | string>;
}

export interface IExamPlugin {
  examType: ExamType;
  displayName: string;
  sections: SectionType[];
  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult;
  validateQuestionBankCount(available: number, required: number): boolean;
}
