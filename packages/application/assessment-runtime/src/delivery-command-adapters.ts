import type {
  CreateAssessmentSessionHandler,
  ResumeAssessmentHandler,
  SaveAnswerHandler,
  SubmitAssessmentHandler,
} from './index';

export class StartAssessmentAdapter {
  constructor(private readonly createHandler: CreateAssessmentSessionHandler) {}
  public async execute(cmd: { studentId: string; instanceId: string }): Promise<string> {
    return this.createHandler.execute(cmd);
  }
}

export class ResumeAssessmentAdapter {
  constructor(private readonly resumeHandler: ResumeAssessmentHandler) {}
  public async execute(cmd: { sessionId: string; token: string }): Promise<void> {
    return this.resumeHandler.execute(cmd);
  }
}

export class SaveAnswerAdapter {
  constructor(private readonly saveAnswerHandler: SaveAnswerHandler) {}
  public async execute(cmd: {
    sessionId: string;
    questionId?: string | undefined;
    questionVersionId: string;
    payload: Record<string, any>;
    state?: 'UNANSWERED' | 'ANSWERED' | 'FLAGGED' | 'SKIPPED' | undefined;
    timeSpentMs?: number | undefined;
  }): Promise<void> {
    return this.saveAnswerHandler.execute({
      sessionId: cmd.sessionId,
      questionId: cmd.questionId || cmd.questionVersionId,
      questionVersionId: cmd.questionVersionId,
      payload: cmd.payload,
      state: cmd.state || 'ANSWERED',
      timeSpentMs: cmd.timeSpentMs || 0,
      recordedAt: new Date(),
    });
  }
}

export class SubmitAssessmentAdapter {
  constructor(private readonly submitHandler: SubmitAssessmentHandler) {}
  public async execute(cmd: {
    sessionId: string;
    signature?: string | undefined;
    serverId?: string | undefined;
  }): Promise<void> {
    return this.submitHandler.execute({
      sessionId: cmd.sessionId,
      signature: cmd.signature || 'sig-default',
      serverId: cmd.serverId || 'srv-01',
      submittedAt: new Date(),
    });
  }
}
