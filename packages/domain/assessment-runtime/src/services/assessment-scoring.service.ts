import {
  SectionScore,
  SkillScore,
  PracticeRecommendationPayload,
} from '../aggregates/assessment-result.aggregate';

export interface QuestionAnswerInput {
  questionId: string;
  sectionCode: string;
  skillId?: string | undefined;
  skillName?: string | undefined;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  points: number;
}

export interface AssessmentScoringInput {
  studentAnswers: QuestionAnswerInput[];
  passThresholdPercentage?: number;
}

export interface AssessmentScoringOutput {
  overallScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  sectionScores: SectionScore[];
  skillScores: SkillScore[];
  practiceRecommendation: PracticeRecommendationPayload;
}

/**
 * AssessmentScoringService
 *
 * Pure domain policy located in domain-assessment-runtime layer.
 * Zero infrastructure dependencies. Evaluates objective answers, section scores,
 * skill breakdowns, pass/fail thresholds, and practice unlock recommendations.
 */
export class AssessmentScoringService {
  public score(input: AssessmentScoringInput): AssessmentScoringOutput {
    const passThreshold = input.passThresholdPercentage ?? 60.0;

    let totalEarned = 0;
    let totalMax = 0;

    const sectionMap = new Map<string, { earned: number; max: number }>();
    const skillMap = new Map<string, { name: string; earned: number; max: number }>();

    for (const q of input.studentAnswers) {
      const isCorrect =
        q.selectedOptionIds.length === q.correctOptionIds.length &&
        q.selectedOptionIds.every((id) => q.correctOptionIds.includes(id));

      const earned = isCorrect ? q.points : 0;
      totalEarned += earned;
      totalMax += q.points;

      // Section accumulation
      const sec = sectionMap.get(q.sectionCode) || { earned: 0, max: 0 };
      sec.earned += earned;
      sec.max += q.points;
      sectionMap.set(q.sectionCode, sec);

      // Skill accumulation
      if (q.skillId) {
        const sk = skillMap.get(q.skillId) || { name: q.skillName || q.skillId, earned: 0, max: 0 };
        sk.earned += earned;
        sk.max += q.points;
        skillMap.set(q.skillId, sk);
      }
    }

    const percentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
    const isPassed = percentage >= passThreshold;

    const sectionScores: SectionScore[] = Array.from(sectionMap.entries()).map(([code, val]) => {
      const p = val.max > 0 ? (val.earned / val.max) * 100 : 0;
      return {
        sectionCode: code,
        score: val.earned,
        maxScore: val.max,
        percentage: Number(p.toFixed(1)),
        passed: p >= passThreshold,
      };
    });

    const skillScores: SkillScore[] = Array.from(skillMap.entries()).map(([skId, val]) => {
      const p = val.max > 0 ? (val.earned / val.max) * 100 : 0;
      return {
        skillId: skId,
        skillName: val.name,
        score: val.earned,
        maxScore: val.max,
        percentage: Number(p.toFixed(1)),
      };
    });

    // Determine practice recommendations for skills under threshold
    const weakSkills = skillScores
      .filter((s) => s.percentage < passThreshold)
      .map((s) => s.skillId);
    const practiceRecommendation: PracticeRecommendationPayload = {
      recommendedSkillIds: weakSkills,
      recommendedModules: weakSkills.map((sk) => `mod-${sk}`),
      rationale:
        weakSkills.length > 0
          ? `Targeted practice recommended for ${weakSkills.length} skill(s) scoring below ${passThreshold}%.`
          : 'All competencies satisfied at target proficiency.',
    };

    return {
      overallScore: Number(totalEarned.toFixed(2)),
      maxScore: Number(totalMax.toFixed(2)),
      percentage: Number(percentage.toFixed(1)),
      isPassed,
      sectionScores,
      skillScores,
      practiceRecommendation,
    };
  }
}
