/**
 * Assessment Intelligence Domain Utility (Phase 3)
 *
 * Pure, deterministic analysis of authoritative assessment results.
 * Strictly read-only presentation logic with zero side effects:
 * - No network calls
 * - No database mutations
 * - No alternative scoring or recalculated bands
 * - No unsupported psychological or predictive claims
 */

export interface AssessmentSectionScore {
  sectionCode: string;
  sectionName: string;
  scorePercentage: number;
  computedLevel?: string;
  evaluationState?: string;
}

export interface VerifiedAssessmentResult {
  resultId: string;
  attemptId: string;
  studentId?: string;
  examType?: string;
  assessmentCategory?: string; // 'DIAGNOSTIC' | 'MOCK' | 'PRACTICE'
  status?: string;
  attemptStatus?: string;
  placementLifecycle?: 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | string;
  overallScore: number;
  placementStage?: string;
  cefrLevel?: string;
  predictedBand?: string;
  sectionScores?: AssessmentSectionScore[];
  strengths?: string[];
  focusAreas?: string[];
  recommendedNextStep?: string;
  recommendedDuration?: string;
  aiFeedback?: {
    summary?: string;
    nextSteps?: string;
    recommendedModules?: string[];
  };
  generatedAt?: string;
}

export interface SkillInsight {
  skillCode: string;
  skillName: string;
  scorePercentage: number;
  explanation: string;
}

export interface BaselineVsMockComparison {
  baselineResultId: string;
  mockResultId: string;
  examType: string;
  baselineDate: string;
  mockDate: string;
  baselineOverallScore: number;
  mockOverallScore: number;
  scoreDelta: number; // numerical difference (mock - baseline)
  baselineBand?: string;
  mockBand?: string;
  bandDelta?: number; // numerical difference (e.g. +0.5)
  summaryStatement: string; // purely factual statement without future predictions
}

export interface ProgressionMilestone {
  resultId: string;
  attemptId: string;
  assessmentType: 'Diagnostic' | 'Mock Examination' | 'Assessment';
  category: string;
  date: string;
  formattedDate: string;
  overallScore: number;
  predictedBand?: string;
  cefrLevel?: string;
  placementStage?: string;
}

export interface CandidateIntelligenceProfile {
  examType: string;
  baselineResult: VerifiedAssessmentResult | null;
  latestResult: VerifiedAssessmentResult | null;
  hasDiagnostic: boolean;
  hasCompletedMock: boolean;
  totalAssessmentsCount: number;
  strongestSkill: SkillInsight | null;
  priorityDevelopmentArea: SkillInsight | null;
  priorityEvidence: string;
  recommendedAction: {
    label: string;
    evidence: string;
    destination: string;
    targetSkill?: string;
    state: 'NO_DIAGNOSTIC' | 'DIAGNOSTIC_PRIORITY' | 'DIAGNOSTIC_BALANCED' | 'MOCK_REVIEW';
  };
  comparison: BaselineVsMockComparison | null;
  chronologicalProgression: ProgressionMilestone[];
}

/**
 * Extracts numeric band value from band string (e.g. "Band 6.5" -> 6.5, "7.0" -> 7.0)
 */
export function parseNumericBand(bandStr?: string): number | null {
  if (!bandStr) return null;
  const match = bandStr.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return isNaN(val) ? null : val;
}

/**
 * Normalizes section name to canonical practice skill name where supported.
 * E.g. "Reading Comprehension" -> "Reading", "Writing & Essay" -> "Writing", "Grammar & Syntax" -> "Grammar"
 */
export function normalizeSkillName(rawName: string): string {
  const lower = rawName.toLowerCase();
  if (lower.includes('reading')) return 'Reading';
  if (lower.includes('listening')) return 'Listening';
  if (lower.includes('writing') || lower.includes('essay')) return 'Writing';
  if (lower.includes('speaking')) return 'Speaking';
  if (lower.includes('grammar') || lower.includes('syntax')) return 'Grammar';
  if (lower.includes('math')) return 'Math';
  return rawName.trim();
}

/**
 * Formats ISO date to a clean readable date
 */
export function formatAssessmentDate(dateStr?: string): string {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Core Intelligence Engine: Analyzes verified assessment outcomes and derives
 * transparent, evidence-based preparation insights strictly scoped by examination.
 */
export function analyzeAssessmentIntelligence(
  rawResults: VerifiedAssessmentResult[] | null | undefined,
  targetExamType?: string
): CandidateIntelligenceProfile {
  const results = Array.isArray(rawResults) ? rawResults : [];

  // Determine examination scope: use targetExamType if provided, else dominant examType from latest result
  const resolvedExamType =
    targetExamType ||
    (results.length > 0 && results[0]?.examType ? results[0].examType : 'English Proficiency');

  // Strict examination isolation (Section 4): Filter results exclusively belonging to this exam
  const examResults = results.filter((r) => {
    if (!r.examType) return true; // generic match if undefined
    return r.examType.toLowerCase() === resolvedExamType.toLowerCase();
  });

  // Section 6 & 7: Filter out incomplete, in_progress, or abandoned attempts
  const completedExamResults = examResults.filter((r) => {
    if (typeof r.overallScore !== 'number' || isNaN(r.overallScore) || r.overallScore < 0) {
      return false;
    }
    const anyStatus = r.status || r.attemptStatus || r.placementLifecycle;
    if (typeof anyStatus === 'string') {
      const lower = anyStatus.toLowerCase();
      if (lower === 'in_progress' || lower === 'abandoned' || lower === 'evaluating') {
        return false;
      }
    }
    return true;
  });

  // Empty state profile when no completed assessments exist
  if (completedExamResults.length === 0) {
    return {
      examType: resolvedExamType,
      baselineResult: null,
      latestResult: null,
      hasDiagnostic: false,
      hasCompletedMock: false,
      totalAssessmentsCount: 0,
      strongestSkill: null,
      priorityDevelopmentArea: null,
      priorityEvidence: 'Complete your Diagnostic Pre-Assessment to establish your baseline.',
      recommendedAction: {
        label: 'Take Pre-Assessment',
        evidence: 'Complete your Diagnostic Pre-Assessment to calibrate your baseline performance.',
        destination: '/student/assessments',
        state: 'NO_DIAGNOSTIC',
      },
      comparison: null,
      chronologicalProgression: [],
    };
  }

  // Section 5: Baseline = Earliest valid completed DIAGNOSTIC result for the same exam
  const diagnosticResults = completedExamResults
    .filter((r) => r.assessmentCategory?.toUpperCase() === 'DIAGNOSTIC')
    .sort((a, b) => {
      const timeA = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
      const timeB = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
      return timeA - timeB; // Chronological (earliest first)
    });

  const baselineResult = diagnosticResults.length > 0 ? diagnosticResults[0] : null;

  // Section 6: Latest Result = Most recent valid completed result within the same exam
  const sortedDesc = [...completedExamResults].sort((a, b) => {
    const timeA = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
    const timeB = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
    return timeB - timeA; // Most recent first
  });

  const latestResult = sortedDesc[0];

  // Section 2 & 3: Critical Score Comparability Check
  // Inspect section scores of the latest relevant assessment
  const rawSections = Array.isArray(latestResult.sectionScores) ? latestResult.sectionScores : [];

  // Filter valid sections with numeric percentage on a 0-100 scale
  const validSections = rawSections.filter(
    (s) =>
      typeof s.scorePercentage === 'number' &&
      !isNaN(s.scorePercentage) &&
      s.scorePercentage >= 0 &&
      s.scorePercentage <= 100 &&
      Boolean(s.sectionName || s.sectionCode)
  );

  let strongestSkill: SkillInsight | null = null;
  let priorityDevelopmentArea: SkillInsight | null = null;
  let priorityEvidence = 'More performance data is needed to identify a clear priority area.';

  // Section 3 (Case A): Strongest and weakest are ONLY computed when at least 2 comparable sections exist
  if (validSections.length >= 2) {
    const scores = validSections.map((s) => s.scorePercentage);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // If all sections have the exact same score, performance is balanced
    if (minScore === maxScore) {
      priorityEvidence = 'All measured skills currently show balanced performance.';
    } else {
      // Find lowest measured skill (Priority 1)
      const lowestSec = validSections.find((s) => s.scorePercentage === minScore);
      // Find highest measured skill
      const highestSec = validSections.find((s) => s.scorePercentage === maxScore);

      if (lowestSec) {
        const cleanName = normalizeSkillName(lowestSec.sectionName || lowestSec.sectionCode);
        priorityDevelopmentArea = {
          skillCode: lowestSec.sectionCode,
          skillName: cleanName,
          scorePercentage: lowestSec.scorePercentage,
          explanation: `${cleanName} is currently your lowest measured comparable skill (${lowestSec.scorePercentage}%).`,
        };
        priorityEvidence = `${cleanName} (${lowestSec.scorePercentage}%) is currently your lowest measured skill area.`;
      }

      if (highestSec) {
        const cleanName = normalizeSkillName(highestSec.sectionName || highestSec.sectionCode);
        strongestSkill = {
          skillCode: highestSec.sectionCode,
          skillName: cleanName,
          scorePercentage: highestSec.scorePercentage,
          explanation: `${cleanName} is currently your highest measured comparable skill (${highestSec.scorePercentage}%).`,
        };
      }
    }
  } else if (validSections.length === 1) {
    // Only one section exists: no comparative strongest/weakest possible
    priorityEvidence = 'Complete more skill modules to enable comparative skill analytics.';
  }

  // Section 7 & 8: Baseline vs Mock Comparison
  // Requires: baselineResult exists AND a completed mock exam exists for the same exam type
  const mockResults = completedExamResults
    .filter((r) => r.assessmentCategory?.toUpperCase() === 'MOCK')
    .sort((a, b) => {
      const timeA = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
      const timeB = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
      return timeB - timeA; // latest mock first
    });

  const latestMock = mockResults.length > 0 ? mockResults[0] : null;
  let comparison: BaselineVsMockComparison | null = null;

  if (baselineResult && latestMock && baselineResult.resultId !== latestMock.resultId) {
    const rawDelta = Math.round((latestMock.overallScore - baselineResult.overallScore) * 10) / 10;
    const baseBandNum = parseNumericBand(baselineResult.predictedBand);
    const mockBandNum = parseNumericBand(latestMock.predictedBand);

    let bandDelta: number | undefined = undefined;
    let summaryStatement = '';

    const isIelts = resolvedExamType.toLowerCase().includes('ielts');
    const isSat = resolvedExamType.toLowerCase().includes('sat');

    if (
      isIelts &&
      baseBandNum !== null &&
      mockBandNum !== null &&
      baseBandNum <= 9 &&
      mockBandNum <= 9
    ) {
      bandDelta = Math.round((mockBandNum - baseBandNum) * 10) / 10;
      if (bandDelta > 0) {
        summaryStatement = `Latest mock: ${bandDelta} bands higher than your diagnostic baseline.`;
      } else if (bandDelta < 0) {
        summaryStatement = `Latest mock: ${Math.abs(bandDelta)} bands lower than your diagnostic baseline.`;
      } else {
        summaryStatement = 'Latest mock matches your diagnostic baseline band.';
      }
    } else if (
      isSat &&
      baseBandNum !== null &&
      mockBandNum !== null &&
      baseBandNum >= 400 &&
      mockBandNum >= 400
    ) {
      const ptDelta = Math.round(mockBandNum - baseBandNum);
      const sign = ptDelta > 0 ? '+' : '';
      summaryStatement = `Latest mock: ${sign}${ptDelta} points compared to your diagnostic baseline.`;
    } else {
      const sign = rawDelta > 0 ? '+' : '';
      summaryStatement = `Latest mock score: ${sign}${rawDelta}% compared to your diagnostic baseline.`;
    }

    comparison = {
      baselineResultId: baselineResult.resultId,
      mockResultId: latestMock.resultId,
      examType: resolvedExamType,
      baselineDate: formatAssessmentDate(baselineResult.generatedAt),
      mockDate: formatAssessmentDate(latestMock.generatedAt),
      baselineOverallScore: baselineResult.overallScore,
      mockOverallScore: latestMock.overallScore,
      scoreDelta: rawDelta,
      baselineBand: baselineResult.predictedBand,
      mockBand: latestMock.predictedBand,
      bandDelta,
      summaryStatement,
    };
  }

  // Section 11 & 13: Deterministic Recommended Action & Destination
  let recommendedAction: CandidateIntelligenceProfile['recommendedAction'];

  if (!baselineResult) {
    // State A: No Diagnostic
    recommendedAction = {
      label: 'Take Pre-Assessment',
      evidence: 'Complete your Diagnostic Pre-Assessment to calibrate your baseline performance.',
      destination: '/student/assessments',
      state: 'NO_DIAGNOSTIC',
    };
  } else if (latestResult.assessmentCategory?.toUpperCase() === 'MOCK') {
    // State D: Latest completed activity is a full mock
    recommendedAction = {
      label: 'Review Results',
      evidence:
        'Your recent full mock examination has been scored. Review your comprehensive performance ledger.',
      destination: '/student/results',
      state: 'MOCK_REVIEW',
    };
  } else if (priorityDevelopmentArea) {
    // State B: Diagnostic completed + clear lowest skill
    const targetSkill = priorityDevelopmentArea.skillName;
    recommendedAction = {
      label: `Practice ${targetSkill} →`,
      evidence: `Your current priority area is ${targetSkill} based on your latest measured skill performance.`,
      destination: `/practice?skill=${encodeURIComponent(targetSkill)}`,
      targetSkill,
      state: 'DIAGNOSTIC_PRIORITY',
    };
  } else {
    // State C: Diagnostic completed, but balanced or insufficient section breakdown
    recommendedAction = {
      label: 'Continue Practice',
      evidence:
        'Your baseline result is available. Continue focused practice drills to strengthen exam competencies.',
      destination: '/practice',
      state: 'DIAGNOSTIC_BALANCED',
    };
  }

  // Section 19 & 20: Chronological Progression Ledger
  // Sort all completed results in chronological order (earliest to latest)
  const chronologicalProgression: ProgressionMilestone[] = [...completedExamResults]
    .sort((a, b) => {
      const timeA = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
      const timeB = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
      return timeA - timeB;
    })
    .map((r) => {
      const isDiag = r.assessmentCategory?.toUpperCase() === 'DIAGNOSTIC';
      const isMock = r.assessmentCategory?.toUpperCase() === 'MOCK';
      const assessmentType = isDiag ? 'Diagnostic' : isMock ? 'Mock Examination' : 'Assessment';

      return {
        resultId: r.resultId,
        attemptId: r.attemptId,
        assessmentType,
        category: r.assessmentCategory || 'ASSESSMENT',
        date: r.generatedAt || '',
        formattedDate: formatAssessmentDate(r.generatedAt),
        overallScore: r.overallScore,
        predictedBand: r.predictedBand,
        cefrLevel: r.cefrLevel,
        placementStage: r.placementStage,
      };
    });

  return {
    examType: resolvedExamType,
    baselineResult,
    latestResult,
    hasDiagnostic: Boolean(baselineResult),
    hasCompletedMock: Boolean(latestMock),
    totalAssessmentsCount: examResults.length,
    strongestSkill,
    priorityDevelopmentArea,
    priorityEvidence,
    recommendedAction,
    comparison,
    chronologicalProgression,
  };
}
