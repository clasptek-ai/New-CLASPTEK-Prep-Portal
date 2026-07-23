import { AggregateRoot } from '@clasptek/kernel';

export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';

export interface AudienceTarget {
  type: 'ALL' | 'ROLE' | 'COHORT' | 'INSTITUTION';
  targetIds?: string[];
}

export interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  authorId: string;
  status?: AnnouncementStatus;
  audienceTarget?: AudienceTarget;
  effectiveAt?: Date;
  expiresAt?: Date;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AnnouncementAggregate extends AggregateRoot<string> {
  public readonly title: string;
  public readonly content: string;
  public readonly authorId: string;
  private _status: AnnouncementStatus;
  public readonly audienceTarget: AudienceTarget;
  public readonly effectiveAt?: Date;
  public readonly expiresAt?: Date;
  private _version: number;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AnnouncementProps) {
    super(props.id);
    this.title = props.title;
    this.content = props.content;
    this.authorId = props.authorId;
    this._status = props.status || 'DRAFT';
    this.audienceTarget = props.audienceTarget || { type: 'ALL' };
    if (props.effectiveAt !== undefined) this.effectiveAt = props.effectiveAt;
    if (props.expiresAt !== undefined) this.expiresAt = props.expiresAt;
    this._version = props.version || 1;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public get status(): AnnouncementStatus {
    return this._status;
  }

  public get version(): number {
    return this._version;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public publish(): void {
    if (this._status === 'EXPIRED') throw new Error('Cannot publish an expired announcement');
    this._status = 'PUBLISHED';
    this._updatedAt = new Date();
  }

  public expire(): void {
    this._status = 'EXPIRED';
    this._updatedAt = new Date();
  }

  public archive(): void {
    this._status = 'ARCHIVED';
    this._updatedAt = new Date();
  }

  public incrementVersion(): void {
    this._version += 1;
    this._updatedAt = new Date();
  }

  public isVisibleAt(date: Date = new Date()): boolean {
    if (this._status !== 'PUBLISHED') return false;
    if (this.effectiveAt && date < this.effectiveAt) return false;
    if (this.expiresAt && date > this.expiresAt) return false;
    return true;
  }
}

export interface BroadcastProps {
  id: string;
  announcementId: string;
  sentBy: string;
  audienceSummary: Record<string, any>;
  totalRecipients: number;
  broadcastAt?: Date;
}

export class Broadcast {
  public readonly id: string;
  public readonly announcementId: string;
  public readonly sentBy: string;
  public readonly audienceSummary: Record<string, any>;
  public readonly totalRecipients: number;
  public readonly broadcastAt: Date;

  constructor(props: BroadcastProps) {
    this.id = props.id;
    this.announcementId = props.announcementId;
    this.sentBy = props.sentBy;
    this.audienceSummary = props.audienceSummary;
    this.totalRecipients = props.totalRecipients;
    this.broadcastAt = props.broadcastAt || new Date();
  }
}

export interface AnnouncementRepository {
  save(announcement: AnnouncementAggregate): Promise<void>;
  findById(id: string): Promise<AnnouncementAggregate | null>;
  findPublished(): Promise<AnnouncementAggregate[]>;
  recordBroadcast(broadcast: Broadcast): Promise<void>;
}
