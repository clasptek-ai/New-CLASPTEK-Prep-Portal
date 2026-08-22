export interface BandScoreResult {
  rawScore: number;
  totalQuestions: number;
  percentage: number;
  bandOrScale: string;
  label: string;
  isEstimated?: boolean;
}

export interface IELTSBandDefinition {
  minRaw: number;
  maxRaw: number;
  band: string;
  numericBand: number;
  label: string;
}

/**
 * Official IELTS Academic Reading conversion table mapping raw marks (0–40) to official IELTS Band Scores.
 * Authoritative source: Cambridge English / British Council / IDP official standard.
 */
export const IELTS_ACADEMIC_READING_BAND_TABLE: readonly IELTSBandDefinition[] = [
  { minRaw: 39, maxRaw: 40, band: 'Band 9.0', numericBand: 9.0, label: 'Expert User' },
  { minRaw: 37, maxRaw: 38, band: 'Band 8.5', numericBand: 8.5, label: 'Very Good User' },
  { minRaw: 35, maxRaw: 36, band: 'Band 8.0', numericBand: 8.0, label: 'Very Good User' },
  { minRaw: 33, maxRaw: 34, band: 'Band 7.5', numericBand: 7.5, label: 'Good User' },
  { minRaw: 30, maxRaw: 32, band: 'Band 7.0', numericBand: 7.0, label: 'Good User' },
  { minRaw: 27, maxRaw: 29, band: 'Band 6.5', numericBand: 6.5, label: 'Competent User' },
  { minRaw: 23, maxRaw: 26, band: 'Band 6.0', numericBand: 6.0, label: 'Competent User' },
  { minRaw: 19, maxRaw: 22, band: 'Band 5.5', numericBand: 5.5, label: 'Modest User' },
  { minRaw: 15, maxRaw: 18, band: 'Band 5.0', numericBand: 5.0, label: 'Modest User' },
  { minRaw: 13, maxRaw: 14, band: 'Band 4.5', numericBand: 4.5, label: 'Limited User' },
  { minRaw: 10, maxRaw: 12, band: 'Band 4.0', numericBand: 4.0, label: 'Limited User' },
  { minRaw: 8, maxRaw: 9, band: 'Band 3.5', numericBand: 3.5, label: 'Extremely Limited User' },
  { minRaw: 6, maxRaw: 7, band: 'Band 3.0', numericBand: 3.0, label: 'Extremely Limited User' },
  { minRaw: 4, maxRaw: 5, band: 'Band 2.5', numericBand: 2.5, label: 'Intermittent User' },
  { minRaw: 2, maxRaw: 3, band: 'Band 2.0', numericBand: 2.0, label: 'Intermittent User' },
  { minRaw: 1, maxRaw: 1, band: 'Band 1.0', numericBand: 1.0, label: 'Non-User' },
  { minRaw: 0, maxRaw: 0, band: 'Band 0.0', numericBand: 0.0, label: 'Did Not Attempt' },
];

/**
 * Looks up official IELTS Academic Reading band score from a raw score out of 40.
 */
export function lookupIELTSAcademicReadingBand(rawScore: number): {
  band: string;
  numericBand: number;
  label: string;
} {
  const clampedRaw = Math.max(0, Math.min(40, Math.round(rawScore)));
  const match = IELTS_ACADEMIC_READING_BAND_TABLE.find(
    (entry) => clampedRaw >= entry.minRaw && clampedRaw <= entry.maxRaw
  );
  if (match) {
    return { band: match.band, numericBand: match.numericBand, label: match.label };
  }
  return { band: 'Band 0.0', numericBand: 0.0, label: 'Did Not Attempt' };
}

/**
 * Calculates IELTS Academic Reading score preserving distinction between:
 * 1. Raw score (e.g. 28)
 * 2. Completion / Performance percentage (e.g. 70%)
 * 3. IELTS band score (e.g. Band 6.5)
 */
export function calculateIELTSAcademicReadingScore(
  rawScore: number,
  totalQuestions: number = 40
): BandScoreResult {
  const safeTotal = totalQuestions > 0 ? totalQuestions : 40;
  const safeRaw = Math.max(0, Math.min(safeTotal, rawScore));
  const percentage = Math.round((safeRaw / safeTotal) * 100);

  if (safeTotal === 40) {
    const { band, label } = lookupIELTSAcademicReadingBand(safeRaw);
    return {
      rawScore: safeRaw,
      totalQuestions: safeTotal,
      percentage,
      bandOrScale: band,
      label,
      isEstimated: false,
    };
  }

  // Partial / non-standard practice set: estimate band on equivalent 40-question scale
  const rawEquivalent = Math.round((safeRaw / safeTotal) * 40);
  const { band, label } = lookupIELTSAcademicReadingBand(rawEquivalent);

  return {
    rawScore: safeRaw,
    totalQuestions: safeTotal,
    percentage,
    bandOrScale: `Estimated ${band}`,
    label: `Estimated • ${label}`,
    isEstimated: true,
  };
}

/**
 * Calculates official band scale or exam-specific scoring per exam specification.
 */
export function calculateBandOrScaleScore(
  exam: string,
  rawScore: number,
  totalQuestions: number
): BandScoreResult {
  const safeTotal = totalQuestions > 0 ? totalQuestions : 1;
  const safeRaw = Math.max(0, Math.min(safeTotal, rawScore));
  const percentage = Math.round((safeRaw / safeTotal) * 100);

  if (exam.includes('IELTS')) {
    return calculateIELTSAcademicReadingScore(safeRaw, safeTotal);
  } else if (exam === 'TOEFL iBT') {
    const toeflScale = Math.round((percentage / 100) * 120);
    return {
      rawScore: safeRaw,
      totalQuestions: safeTotal,
      percentage,
      bandOrScale: `${toeflScale} / 120`,
      label:
        toeflScale >= 100 ? 'Advanced' : toeflScale >= 80 ? 'High Intermediate' : 'Intermediate',
      isEstimated: false,
    };
  } else if (exam === 'SAT') {
    const satScale = 400 + Math.round((percentage / 100) * 1200);
    return {
      rawScore: safeRaw,
      totalQuestions: safeTotal,
      percentage,
      bandOrScale: `${satScale} / 1600`,
      label: satScale >= 1400 ? 'Competitive' : satScale >= 1200 ? 'Above Average' : 'Developing',
      isEstimated: false,
    };
  } else if (exam === 'CELPIP') {
    const clbLevel = Math.min(12, Math.max(1, Math.round((percentage / 100) * 12)));
    return {
      rawScore: safeRaw,
      totalQuestions: safeTotal,
      percentage,
      bandOrScale: `CLB ${clbLevel}`,
      label:
        clbLevel >= 9
          ? 'Advanced Community & Workplace'
          : clbLevel >= 7
            ? 'Adequate Intermediate'
            : 'Basic Fluency',
      isEstimated: false,
    };
  } else {
    return {
      rawScore: safeRaw,
      totalQuestions: safeTotal,
      percentage,
      bandOrScale: `${percentage}%`,
      label: percentage >= 80 ? 'Proficient' : percentage >= 60 ? 'Developing' : 'Needs Practice',
      isEstimated: false,
    };
  }
}
