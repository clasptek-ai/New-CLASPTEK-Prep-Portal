import { AggregateRoot } from '@clasptek/kernel';

export type NotificationStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRY'
  | 'DEAD_LETTER'
  | 'READ'
  | 'ARCHIVED';
export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type NotificationCategory =
  'Academic' | 'System' | 'Achievement' | 'Security' | 'Administration';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type PreferenceProfile = 'ACADEMIC_ONLY' | 'EVERYTHING' | 'ANNOUNCEMENTS_ONLY' | 'MINIMAL';
export type DeliveryPolicyType = 'IMMEDIATE' | 'SCHEDULED' | 'DAILY_DIGEST' | 'WEEKLY_DIGEST';

export class NotificationId {
  constructor(public readonly value: string) {
    if (!value) throw new Error('NotificationId cannot be empty');
  }
}

export class DeliveryPolicy {
  constructor(
    public readonly type: DeliveryPolicyType = 'IMMEDIATE',
    public readonly scheduledFor?: Date
  ) {
    if (type === 'SCHEDULED' && !scheduledFor) {
      throw new Error('Scheduled delivery policy requires scheduledFor timestamp');
    }
  }
}

export class RetryPolicy {
  constructor(
    public readonly maxRetries: number = 3,
    public readonly retryIntervalSeconds: number = 300,
    public readonly backoffMultiplier: number = 2.0
  ) {
    if (maxRetries < 1) throw new Error('maxRetries must be at least 1');
  }

  public calculateNextRetry(attemptCount: number): Date {
    const delaySeconds =
      this.retryIntervalSeconds * Math.pow(this.backoffMultiplier, attemptCount - 1);
    return new Date(Date.now() + delaySeconds * 1000);
  }
}

export class NotificationPreference {
  constructor(
    public readonly userId: string,
    public readonly presetProfile: PreferenceProfile = 'EVERYTHING',
    public readonly enabledCategories: NotificationCategory[] = [
      'Academic',
      'System',
      'Achievement',
      'Security',
      'Administration',
    ],
    public readonly channelSettings: Record<NotificationChannel, boolean> = {
      IN_APP: true,
      EMAIL: false,
      SMS: false,
      WHATSAPP: false,
      PUSH: false,
    },
    public readonly digestFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' = 'IMMEDIATE'
  ) {}

  public isCategoryEnabled(category: NotificationCategory): boolean {
    if (this.presetProfile === 'MINIMAL') return category === 'Security';
    if (this.presetProfile === 'ACADEMIC_ONLY')
      return category === 'Academic' || category === 'Security';
    return this.enabledCategories.includes(category);
  }
}

export interface CommunicationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRatePercentage: number;
  readRatePercentage: number;
  queueThroughputPerMinute: number;
  channelUtilisation: Record<NotificationChannel, number>;
}

export interface AdminDashboardOperations {
  pendingCount: number;
  processingCount: number;
  deliveredCount: number;
  failedCount: number;
  retryQueueLength: number;
  deadLetterCount: number;
  channelHealth: Record<NotificationChannel, 'HEALTHY' | 'DEGRADED' | 'DISABLED'>;
}

export interface NotificationProps {
  id: string;
  recipientId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  deliveryPolicy?: DeliveryPolicy;
  retryPolicy?: RetryPolicy;
  attempts?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  archivedAt?: Date;
}

export class NotificationAggregate extends AggregateRoot<string> {
  public readonly recipientId: string;
  public readonly category: NotificationCategory;
  public readonly priority: NotificationPriority;
  public readonly title: string;
  public readonly body: string;
  private _status: NotificationStatus;
  public readonly channel: NotificationChannel;
  public readonly deliveryPolicy: DeliveryPolicy;
  public readonly retryPolicy: RetryPolicy;
  private _attempts: number;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private _deliveredAt?: Date;
  private _readAt?: Date;
  private _archivedAt?: Date;

  constructor(props: NotificationProps) {
    super(props.id);
    this.recipientId = props.recipientId;
    this.category = props.category;
    this.priority = props.priority || 'NORMAL';
    this.title = props.title;
    this.body = props.body;
    this._status = props.status || 'CREATED';
    this.channel = props.channel || 'IN_APP';
    this.deliveryPolicy = props.deliveryPolicy || new DeliveryPolicy('IMMEDIATE');
    this.retryPolicy = props.retryPolicy || new RetryPolicy();
    this._attempts = props.attempts || 0;
    this.metadata = props.metadata || {};
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    if (props.deliveredAt !== undefined) this._deliveredAt = props.deliveredAt;
    if (props.readAt !== undefined) this._readAt = props.readAt;
    if (props.archivedAt !== undefined) this._archivedAt = props.archivedAt;
  }

  public get status(): NotificationStatus {
    return this._status;
  }

  public get attempts(): number {
    return this._attempts;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deliveredAt(): Date | undefined {
    return this._deliveredAt;
  }

  public get readAt(): Date | undefined {
    return this._readAt;
  }

  public get archivedAt(): Date | undefined {
    return this._archivedAt;
  }

  public markQueued(): void {
    if (this._status !== 'CREATED' && this._status !== 'RETRY') {
      throw new Error(`Cannot queue notification from state ${this._status}`);
    }
    this._status = 'QUEUED';
    this._updatedAt = new Date();
  }

  public markProcessing(): void {
    if (this._status !== 'QUEUED') {
      throw new Error(`Cannot process notification unless queued (current: ${this._status})`);
    }
    this._status = 'PROCESSING';
    this._attempts += 1;
    this._updatedAt = new Date();
  }

  public markDelivered(): void {
    if (this._status !== 'PROCESSING' && this._status !== 'QUEUED') {
      throw new Error(`Cannot mark delivered from state ${this._status}`);
    }
    this._status = 'DELIVERED';
    this._deliveredAt = new Date();
    this._updatedAt = new Date();
  }

  public markFailed(): void {
    if (this._attempts >= this.retryPolicy.maxRetries) {
      this._status = 'DEAD_LETTER';
    } else {
      this._status = 'RETRY';
    }
    this._updatedAt = new Date();
  }

  public markRead(): void {
    if (this._status === 'ARCHIVED') {
      throw new Error('Cannot mark archived notification as read');
    }
    this._status = 'READ';
    this._readAt = new Date();
    this._updatedAt = new Date();
  }

  public markArchived(): void {
    this._status = 'ARCHIVED';
    this._archivedAt = new Date();
    this._updatedAt = new Date();
  }
}

export interface NotificationRepository {
  save(notification: NotificationAggregate): Promise<void>;
  findById(id: string): Promise<NotificationAggregate | null>;
  findByRecipient(recipientId: string): Promise<NotificationAggregate[]>;
  savePreference(pref: NotificationPreference): Promise<void>;
  getPreference(userId: string): Promise<NotificationPreference | null>;
  getAnalytics(): Promise<CommunicationAnalytics>;
  getAdminDashboard(): Promise<AdminDashboardOperations>;
}
