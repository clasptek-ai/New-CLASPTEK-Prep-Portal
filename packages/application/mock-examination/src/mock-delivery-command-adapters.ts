import {
  IntegrityDetectionService,
  IntegrityEnforcementService,
  IntegrityEventType,
} from '@clasptek/domain-mock-examination';

export interface ProcessIntegrityEventCommand {
  sessionId: string;
  studentId: string;
  eventType: IntegrityEventType;
  currentWarningCount: number;
  details?: string | undefined;
}

export class ProcessIntegrityEventHandler {
  private readonly detection = new IntegrityDetectionService();
  private readonly enforcement = new IntegrityEnforcementService(3);

  public async execute(cmd: ProcessIntegrityEventCommand) {
    const detectionResult = this.detection.detectEvent(cmd.eventType, { details: cmd.details });
    const outcome = this.enforcement.processViolation(cmd.currentWarningCount, detectionResult);

    return {
      sessionId: cmd.sessionId,
      warningCount: outcome.warningCount,
      shouldLock: outcome.shouldLock,
      actionTaken: outcome.actionTaken,
      auditMessage: outcome.auditMessage,
      timestamp: detectionResult.timestamp.toISOString(),
    };
  }
}
