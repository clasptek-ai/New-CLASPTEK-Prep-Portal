import { DiagnosticAttempt } from '../aggregates/DiagnosticAttempt';
import { AssessmentForm } from '../aggregates/AssessmentForm';
import { PlacementResult } from '../aggregates/PlacementResult';
import { LearningStage } from '../value-objects/LearningStage';
import { randomUUID } from 'crypto';

export class PlacementEngine {
  public static calculate(attempt: DiagnosticAttempt, form: AssessmentForm): PlacementResult {
    const responses = attempt.responses;
    const questionsAnswered = responses.length;

    if (questionsAnswered === 0) {
      return new PlacementResult(
        randomUUID(),
        attempt.id,
        attempt.studentId,
        'Foundation',
        0.0,
        0.0,
        0.0,
        0.0,
        0,
        attempt.tenantId
      );
    }

    // 1. Calculate accuracy/score
    const correctCount = responses.filter((r) => r.isCorrect).length;
    const scorePercentage = (correctCount / questionsAnswered) * 100;

    // 2. Calculate Blueprint Coverage (B)
    const blueprintObjectives = form.blueprintConfig.blueprintObjectives || [];
    const totalSkills = blueprintObjectives.length;
    let blueprintCoverage = 100.0;

    if (totalSkills > 0) {
      // Mock category extraction based on index if not explicitly configured on responses
      const answeredCategories = new Set<string>();
      responses.forEach((_, idx) => {
        const objIndex = idx % totalSkills;
        if (blueprintObjectives[objIndex]) {
          answeredCategories.add(blueprintObjectives[objIndex].code);
        }
      });
      blueprintCoverage = (answeredCategories.size / totalSkills) * 100;
    }

    // 3. Calculate Difficulty Coverage (D)
    // Assume 3 tiers of difficulty (Low, Medium, High). Map index % 3 to difficulty.
    const difficultyTiersTested = new Set<number>();
    responses.forEach((_, idx) => {
      difficultyTiersTested.add(idx % 3);
    });
    const difficultyCoverage = (difficultyTiersTested.size / 3) * 100;

    // 4. Calculate Placement Confidence (C)
    // Confidence combines accuracy rate and blueprint coverage percentage
    const confidencePercentage = scorePercentage * (blueprintCoverage / 100);

    // 5. Calculate Reliability Score (R)
    // Scaled reliability metric up to 100% based on total evidence gathered (questions answered)
    const reliabilityScore = Math.min(100, questionsAnswered * 5);

    // 6. Assign Learning Stage based on accuracy score
    const placementStage = LearningStage.fromScore(scorePercentage).stage;

    return new PlacementResult(
      randomUUID(),
      attempt.id,
      attempt.studentId,
      placementStage,
      parseFloat(confidencePercentage.toFixed(2)),
      parseFloat(reliabilityScore.toFixed(2)),
      parseFloat(blueprintCoverage.toFixed(2)),
      parseFloat(difficultyCoverage.toFixed(2)),
      questionsAnswered,
      attempt.tenantId
    );
  }
}
