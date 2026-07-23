import {
  SubmissionStrategyFactory,
  SubmissionPayload,
  SubmissionResult,
  SubjectiveEvaluationQueue,
  EvaluationRepositoryContract,
} from '@clasptek/domain-mock-examination';

export class SubmissionOrchestrationEngine {
  constructor(private readonly evalRepo?: EvaluationRepositoryContract) {}

  public async orchestrateSubmission(
    payload: SubmissionPayload,
    strategyMode: 'OBJECTIVE' | 'SUBJECTIVE' | 'MIXED' = 'MIXED'
  ): Promise<{ result: SubmissionResult; queue: SubjectiveEvaluationQueue }> {
    const strategy = SubmissionStrategyFactory.getStrategy(strategyMode);
    const result = strategy.processSubmission(payload);

    const queue = new SubjectiveEvaluationQueue(`seq-${payload.sessionId}`, []);

    const subjectiveAnswers = payload.answers.filter(
      (a) => a.sectionType === 'WRITING' || a.sectionType === 'SPEAKING'
    );

    for (const ans of subjectiveAnswers) {
      queue.enqueueItem(
        payload.sessionId,
        payload.studentId,
        ans.questionId,
        ans.sectionType as 'WRITING' | 'SPEAKING',
        ans.payload
      );
    }

    if (this.evalRepo && subjectiveAnswers.length > 0) {
      await this.evalRepo.saveQueue(queue);
    }

    return { result, queue };
  }
}
