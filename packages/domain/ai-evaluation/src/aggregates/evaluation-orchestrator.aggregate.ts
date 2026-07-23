import { AggregateRoot } from '@clasptek/kernel';

export type OrchestrationState = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'NEEDS_REVIEW' | 'FAILED';

export class EvaluationOrchestrator extends AggregateRoot<string> {
  private _status: OrchestrationState;
  private _attempts: number = 0;
  private _maxAttempts: number = 3;
  private _errorMessage?: string | undefined;

  constructor(props: {
    id: string;
    status?: OrchestrationState | undefined;
    attempts?: number | undefined;
    maxAttempts?: number | undefined;
    errorMessage?: string | undefined;
  }) {
    super(props.id);
    this._status = props.status ?? 'QUEUED';
    this._attempts = props.attempts ?? 0;
    this._maxAttempts = props.maxAttempts ?? 3;
    this._errorMessage = props.errorMessage;
  }

  get status(): OrchestrationState {
    return this._status;
  }

  get attempts(): number {
    return this._attempts;
  }

  get maxAttempts(): number {
    return this._maxAttempts;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  public dispatch(): void {
    if (this._status !== 'QUEUED' && this._status !== 'FAILED') {
      throw new Error(`Cannot dispatch orchestrator in status ${this._status}`);
    }
    this._status = 'RUNNING';
    this._attempts += 1;
  }

  public complete(): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot complete orchestrator in status ${this._status}`);
    }
    this._status = 'COMPLETED';
  }

  public fail(reason: string): boolean {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot fail orchestrator in status ${this._status}`);
    }
    this._errorMessage = reason;
    if (this._attempts < this._maxAttempts) {
      this._status = 'FAILED';
      return true; // retry possible
    } else {
      this._status = 'NEEDS_REVIEW';
      return false; // escalate
    }
  }

  public escalateToNeedsReview(reason: string): void {
    this._status = 'NEEDS_REVIEW';
    this._errorMessage = reason;
  }
}
