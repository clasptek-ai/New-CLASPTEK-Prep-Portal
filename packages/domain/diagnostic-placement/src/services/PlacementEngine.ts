import { DiagnosticAttempt } from '../aggregates/DiagnosticAttempt';
import { AssessmentForm } from '../aggregates/AssessmentForm';
import { PlacementResult } from '../aggregates/PlacementResult';
import { randomUUID } from 'crypto';

export interface PlacementRuleConfig {
  placementLevel: string;
  minOverallScore: number;
  maxOverallScore: number;
  requiredSkillMinimums?: Record<string, number>;
  priority?: number;
}

export interface SectionScoreSummary {
  sectionCode: string;
  total: number;
  answered: number;
  correct: number;
  percentage: number;
}

export class PlacementEngine {
  public static calculateSectionScores(attempt: DiagnosticAttempt): Map<string, SectionScoreSummary> {
    const sectionMap = new Map<string, SectionScoreSummary>();

    for (const resp of attempt.responses) {
      const payload = resp.responsePayload || {};
      const sectionCode = payload.sectionCode || payload.skill || 'General';

      if (!sectionMap.has(sectionCode)) {
        sectionMap.set(sectionCode, {
          sectionCode,
          total: 0,
          answered: 0,
          correct: 0,
          percentage: 0,
        });
      }

      const entry = sectionMap.get(sectionCode)!;
      entry.total += 1;
      if (resp.responsePayload && Object.keys(resp.responsePayload).length > 0) {
        entry.answered += 1;
      }
      if (resp.isCorrect) {
        entry.correct += 1;
      }
    }

    for (const entry of sectionMap.values()) {
      entry.percentage = entry.total > 0 ? (entry.correct / entry.total) * 100 : 0;
    }

    return sectionMap;
  }

  public static determinePlacementStage(
    overallScore: number,
    sectionScores: Map<string, SectionScoreSummary>,
    rules: PlacementRuleConfig[]
  ): string {
    if (!rules || rules.length === 0) {
      // Default fallback rule set
      if (overallScore < 50) return 'FOUNDATION';
      return 'INTERMEDIATE';
    }

    // Sort by priority (higher priority evaluated first)
    const sortedRules = [...rules].sort((a, b) => (b.priority || 1) - (a.priority || 1));

    for (const rule of sortedRules) {
      if (overallScore >= rule.minOverallScore && overallScore <= rule.maxOverallScore) {
        // Check skill minimums if specified
        let satisfiesSkills = true;
        if (rule.requiredSkillMinimums) {
          for (const [skill, minReq] of Object.entries(rule.requiredSkillMinimums)) {
            const sec = sectionScores.get(skill);
            if (!sec || sec.percentage < minReq) {
              satisfiesSkills = false;
              break;
            }
          }
        }
        if (satisfiesSkills) {
          return rule.placementLevel;
        }
      }
    }

    return sortedRules[sortedRules.length - 1]?.placementLevel || 'FOUNDATION';
  }

  public static calculate(
    attempt: DiagnosticAttempt,
    form?: AssessmentForm,
    rules: PlacementRuleConfig[] = []
  ): PlacementResult {
    const responses = attempt.responses;
    const questionsAnswered = responses.length;

    if (questionsAnswered === 0) {
      return new PlacementResult(
        randomUUID(),
        attempt.id,
        attempt.studentId,
        'FOUNDATION',
        0.0,
        0.0,
        0.0,
        0.0,
        0,
        attempt.tenantId
      );
    }

    const correctCount = responses.filter((r) => r.isCorrect).length;
    const overallScore = (correctCount / questionsAnswered) * 100;
    const sectionScores = this.calculateSectionScores(attempt);

    // Calculate real blueprint coverage from objectives
    let blueprintCoverage = 100.0;
    if (form?.blueprintConfig?.blueprintObjectives?.length) {
      const totalObj = form.blueprintConfig.blueprintObjectives.length;
      const testedObj = new Set<string>();
      for (const resp of responses) {
        const objCode = resp.responsePayload?.blueprintObjective || resp.responsePayload?.sectionCode;
        if (objCode) testedObj.add(objCode);
      }
      blueprintCoverage = totalObj > 0 ? (testedObj.size / totalObj) * 100 : 100.0;
    }

    const confidencePercentage = (overallScore * blueprintCoverage) / 100;
    const reliabilityScore = Math.min(100, Math.round((questionsAnswered / Math.max(1, form?.totalQuestions || 20)) * 100));
    const placementStage = this.determinePlacementStage(overallScore, sectionScores, rules);

    return new PlacementResult(
      randomUUID(),
      attempt.id,
      attempt.studentId,
      placementStage,
      parseFloat(confidencePercentage.toFixed(2)),
      parseFloat(reliabilityScore.toFixed(2)),
      parseFloat(blueprintCoverage.toFixed(2)),
      100.0,
      questionsAnswered,
      attempt.tenantId
    );
  }
}
