export interface BandScoreResult {
  rawScore: number;
  totalQuestions: number;
  percentage: number;
  bandOrScale: string;
  label: string;
}

export function calculateBandOrScaleScore(
  exam: string,
  rawScore: number,
  totalQuestions: number
): BandScoreResult {
  const percentage = totalQuestions > 0 ? Math.round((rawScore / totalQuestions) * 100) : 0;

  let bandOrScale = 'Band 6.0';
  let label = 'Competent User';

  if (exam.includes('IELTS')) {
    if (percentage >= 90) {
      bandOrScale = 'Band 8.5';
      label = 'Very Good User';
    } else if (percentage >= 80) {
      bandOrScale = 'Band 7.5';
      label = 'Good User';
    } else if (percentage >= 70) {
      bandOrScale = 'Band 7.0';
      label = 'Good User';
    } else if (percentage >= 60) {
      bandOrScale = 'Band 6.5';
      label = 'Competent User';
    } else if (percentage >= 50) {
      bandOrScale = 'Band 5.5';
      label = 'Modest User';
    } else {
      bandOrScale = 'Band 4.5';
      label = 'Limited User';
    }
  } else if (exam === 'TOEFL iBT') {
    const toeflScale = Math.round((percentage / 100) * 120);
    bandOrScale = `${toeflScale} / 120`;
    label =
      toeflScale >= 100 ? 'Advanced' : toeflScale >= 80 ? 'High Intermediate' : 'Intermediate';
  } else if (exam === 'SAT') {
    const satScale = 400 + Math.round((percentage / 100) * 1200);
    bandOrScale = `${satScale} / 1600`;
    label = satScale >= 1400 ? 'Competitive' : satScale >= 1200 ? 'Above Average' : 'Developing';
  } else if (exam === 'CELPIP') {
    const clbLevel = Math.min(12, Math.max(1, Math.round((percentage / 100) * 12)));
    bandOrScale = `CLB ${clbLevel}`;
    label =
      clbLevel >= 9
        ? 'Advanced Community & Workplace'
        : clbLevel >= 7
          ? 'Adequate Intermediate'
          : 'Basic Fluency';
  } else {
    bandOrScale = `${percentage}%`;
    label = percentage >= 80 ? 'Proficient' : percentage >= 60 ? 'Developing' : 'Needs Practice';
  }

  return {
    rawScore,
    totalQuestions,
    percentage,
    bandOrScale,
    label,
  };
}
