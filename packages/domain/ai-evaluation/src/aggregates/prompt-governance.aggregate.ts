import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// PROMPT GOVERNANCE — Approval & rollout lifecycle tracking
// ═══════════════════════════════════════════════════════════════════

export type GovernanceApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Tracks approval, rollout, and deprecation lifecycle for prompt
 * deployments. Ensures no prompt version enters production without
 * explicit review and controlled rollout.
 */
export class PromptGovernance extends AggregateRoot<string> {
  public readonly promptVersionId: string;
  private _approvalStatus: GovernanceApprovalStatus;
  private _reviewer: string | undefined;
  private _effectiveDate: Date | undefined;
  private _deprecatedDate: Date | undefined;
  private _rolloutPercentage: number;
  private _notes: string;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    promptVersionId: string;
    approvalStatus?: GovernanceApprovalStatus;
    reviewer?: string;
    effectiveDate?: Date;
    deprecatedDate?: Date;
    rolloutPercentage?: number;
    notes?: string;
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.promptVersionId) throw new Error('PromptGovernance promptVersionId cannot be empty');

    this.promptVersionId = props.promptVersionId;
    this._approvalStatus = props.approvalStatus ?? 'PENDING';
    this._reviewer = props.reviewer;
    this._effectiveDate = props.effectiveDate;
    this._deprecatedDate = props.deprecatedDate;
    this._rolloutPercentage = props.rolloutPercentage ?? 0;
    this._notes = props.notes ?? '';
    this.createdAt = props.createdAt ?? new Date();
  }

  get approvalStatus(): GovernanceApprovalStatus {
    return this._approvalStatus;
  }
  get reviewer(): string | undefined {
    return this._reviewer;
  }
  get effectiveDate(): Date | undefined {
    return this._effectiveDate;
  }
  get deprecatedDate(): Date | undefined {
    return this._deprecatedDate;
  }
  get rolloutPercentage(): number {
    return this._rolloutPercentage;
  }
  get notes(): string {
    return this._notes;
  }
  get isApproved(): boolean {
    return this._approvalStatus === 'APPROVED';
  }
  get isFullyRolledOut(): boolean {
    return this._rolloutPercentage === 100;
  }

  /** Approve the prompt version for deployment. */
  public approve(reviewer: string, effectiveDate: Date = new Date()): void {
    if (this._approvalStatus === 'APPROVED') {
      throw new Error('PromptGovernance is already approved');
    }
    this._approvalStatus = 'APPROVED';
    this._reviewer = reviewer;
    this._effectiveDate = effectiveDate;
  }

  /** Reject the prompt version. */
  public reject(reviewer: string, notes: string): void {
    if (this._approvalStatus === 'REJECTED') {
      throw new Error('PromptGovernance is already rejected');
    }
    this._approvalStatus = 'REJECTED';
    this._reviewer = reviewer;
    this._notes = notes;
  }

  /** Update the rollout percentage (gradual deployment). */
  public setRolloutPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
    if (this._approvalStatus !== 'APPROVED') {
      throw new Error('Cannot set rollout percentage for a non-approved prompt version');
    }
    this._rolloutPercentage = percentage;
  }

  /** Mark the prompt version as deprecated (sunset). */
  public deprecateVersion(deprecatedDate: Date = new Date()): void {
    this._deprecatedDate = deprecatedDate;
    this._rolloutPercentage = 0;
  }

  /** Check if this prompt version should be served based on rollout. */
  public shouldServe(): boolean {
    if (this._approvalStatus !== 'APPROVED') return false;
    if (this._deprecatedDate !== undefined) return false;
    if (this._rolloutPercentage === 100) return true;
    return Math.random() * 100 < this._rolloutPercentage;
  }

  public static create(props: { promptVersionId: string; notes?: string }): PromptGovernance {
    return new PromptGovernance({ id: randomUUID(), ...props });
  }
}
