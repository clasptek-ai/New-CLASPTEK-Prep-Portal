import { IExamPlugin, ScoreConversionResult } from '../interfaces/exam-plugin.interface';
import { ExamType, SectionType } from '../../../services/admin/questions.service';

export class ToeflExamPlugin implements IExamPlugin {
  examType: ExamType = 'TOEFL iBT';
  displayName = 'TOEFL iBT Examination Engine';
  sections: SectionType[] = ['Reading', 'Listening', 'Speaking', 'Writing'];

  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const scaledScore = Math.round(ratio * 120);

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (scaledScore >= 110) cefr = 'C2';
    else if (scaledScore >= 95) cefr = 'C1';
    else if (scaledScore >= 72) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `${scaledScore} / 120`,
      overallScore: scaledScore,
      cefrLevel: cefr,
      sectionBreakdown: {
        Reading: Math.round(scaledScore / 4),
        Listening: Math.round(scaledScore / 4),
        Speaking: Math.round(scaledScore / 4),
        Writing: Math.round(scaledScore / 4),
      },
    };
  }

  validateQuestionBankCount(available: number, required: number): boolean {
    return available >= required;
  }
}
