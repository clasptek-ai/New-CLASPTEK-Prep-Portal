import { AggregateRoot } from '@clasptek/kernel';

export type SectionStatus = 'LOCKED' | 'UNLOCKED' | 'STARTED' | 'COMPLETED';

export class MockSection extends AggregateRoot<string> {
  public readonly templateId: string;
  public readonly sectionName: string;
  public readonly orderIndex: number;
  public readonly durationMinutes: number;
  public readonly lockOnComplete: boolean;
  private _status: SectionStatus;
  public startedAt?: Date | undefined;
  public completedAt?: Date | undefined;

  constructor(props: {
    id: string;
    templateId: string;
    sectionName: string;
    orderIndex: number;
    durationMinutes: number;
    lockOnComplete?: boolean | undefined;
    status?: SectionStatus | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
  }) {
    super(props.id);
    this.templateId = props.templateId;
    this.sectionName = props.sectionName;
    this.orderIndex = props.orderIndex;
    this.durationMinutes = props.durationMinutes;
    this.lockOnComplete = props.lockOnComplete ?? true;
    this._status = props.status ?? 'LOCKED';
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
  }

  get status(): SectionStatus {
    return this._status;
  }

  public unlock(): void {
    if (this._status === 'COMPLETED' && this.lockOnComplete) {
      throw new Error('Completed section is locked and cannot be unlocked');
    }
    this._status = 'UNLOCKED';
  }

  public start(): void {
    if (this._status !== 'UNLOCKED') {
      throw new Error('Section must be UNLOCKED before starting');
    }
    this._status = 'STARTED';
    this.startedAt = new Date();
  }

  public complete(): void {
    if (this._status !== 'STARTED') {
      throw new Error('Section must be STARTED to complete');
    }
    this._status = 'COMPLETED';
    this.completedAt = new Date();
  }
}
