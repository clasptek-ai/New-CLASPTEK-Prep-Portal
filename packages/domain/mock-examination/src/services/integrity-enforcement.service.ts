import { IntegrityDetectionResult } from './integrity-detection.service';

export interface EnforcementOutcome {
  warningCount: number;
  maxWarnings: number;
  shouldLock: boolean;
  actionTaken: 'WARNING' | 'LOCK' | 'TERMINATE';
  auditMessage: string;
}

export class IntegrityEnforcementService {
  constructor(private readonly maxWarnings: number = 3) {}

  public processViolation(
    currentWarningCount: number,
    detection: IntegrityDetectionResult
  ): EnforcementOutcome {
    const newCount = currentWarningCount + 1;
    const shouldLock = newCount >= this.maxWarnings;

    const actionTaken = shouldLock ? 'LOCK' : 'WARNING';
    const auditMessage = shouldLock
      ? `Violation limit reached (${newCount}/${this.maxWarnings}). Session auto-locked.`
      : `Warning ${newCount}/${this.maxWarnings} issued for ${detection.type}.`;

    return {
      warningCount: newCount,
      maxWarnings: this.maxWarnings,
      shouldLock,
      actionTaken,
      auditMessage,
    };
  }
}
