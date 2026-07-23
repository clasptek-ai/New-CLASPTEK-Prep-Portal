export type IntegrityEventType =
  'FULLSCREEN_EXITED' | 'BROWSER_BLURRED' | 'TAB_SWITCHED' | 'MULTIPLE_INSTANCES' | 'TIME_ANOMALY';

export interface IntegrityDetectionResult {
  detected: boolean;
  type: IntegrityEventType;
  details: string;
  timestamp: Date;
}

export class IntegrityDetectionService {
  public detectEvent(
    eventType: IntegrityEventType,
    payload?: Record<string, any>
  ): IntegrityDetectionResult {
    return {
      detected: true,
      type: eventType,
      details: payload?.details || `Integrity event detected: ${eventType}`,
      timestamp: new Date(),
    };
  }
}
