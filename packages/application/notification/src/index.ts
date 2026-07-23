import {
  NotificationAggregate,
  NotificationCategory,
  NotificationPriority,
  NotificationPreference,
  NotificationRepository,
  PreferenceProfile,
  DeliveryPolicy,
  RetryPolicy,
  CommunicationAnalytics,
  AdminDashboardOperations,
} from '@clasptek/domain-notification';

export interface CreateNotificationCommand {
  recipientId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  deliveryPolicy?: DeliveryPolicy;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, any>;
}

export class CreateNotificationHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(cmd: CreateNotificationCommand): Promise<string> {
    const pref = await this.repo.getPreference(cmd.recipientId);
    if (pref && !pref.isCategoryEnabled(cmd.category)) {
      throw new Error(`Category ${cmd.category} is disabled by user preferences`);
    }

    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const notification = new NotificationAggregate({
      id,
      recipientId: cmd.recipientId,
      category: cmd.category,
      priority: cmd.priority || 'NORMAL',
      title: cmd.title,
      body: cmd.body,
      ...(cmd.deliveryPolicy !== undefined ? { deliveryPolicy: cmd.deliveryPolicy } : {}),
      ...(cmd.retryPolicy !== undefined ? { retryPolicy: cmd.retryPolicy } : {}),
      ...(cmd.metadata !== undefined ? { metadata: cmd.metadata } : {}),
    });

    notification.markQueued();
    await this.repo.save(notification);
    return id;
  }
}

export class ProcessNotificationQueueHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(id: string): Promise<void> {
    const notif = await this.repo.findById(id);
    if (!notif) throw new Error('Notification not found');

    try {
      notif.markProcessing();
      notif.markDelivered();
    } catch (err) {
      notif.markFailed();
    }

    await this.repo.save(notif);
  }
}

export class MarkNotificationReadHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(id: string, recipientId: string): Promise<void> {
    const notif = await this.repo.findById(id);
    if (!notif) throw new Error('Notification not found');
    if (notif.recipientId !== recipientId) throw new Error('Unauthorized');

    notif.markRead();
    await this.repo.save(notif);
  }
}

export class GetNotificationsHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(recipientId: string): Promise<NotificationAggregate[]> {
    return this.repo.findByRecipient(recipientId);
  }
}

export interface UpdatePreferencesCommand {
  userId: string;
  presetProfile?: PreferenceProfile;
  enabledCategories?: NotificationCategory[];
}

export class UpdateNotificationPreferencesHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(cmd: UpdatePreferencesCommand): Promise<NotificationPreference> {
    const existing = await this.repo.getPreference(cmd.userId);
    const pref = new NotificationPreference(
      cmd.userId,
      cmd.presetProfile || existing?.presetProfile || 'EVERYTHING',
      cmd.enabledCategories ||
        existing?.enabledCategories || [
          'Academic',
          'System',
          'Achievement',
          'Security',
          'Administration',
        ]
    );

    await this.repo.savePreference(pref);
    return pref;
  }
}

export class GetNotificationPreferencesHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(userId: string): Promise<NotificationPreference> {
    const pref = await this.repo.getPreference(userId);
    return pref || new NotificationPreference(userId);
  }
}

export class GetCommunicationAnalyticsHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(): Promise<CommunicationAnalytics> {
    return this.repo.getAnalytics();
  }
}

export class GetAdminDashboardOperationsHandler {
  constructor(private readonly repo: NotificationRepository) {}

  public async execute(): Promise<AdminDashboardOperations> {
    return this.repo.getAdminDashboard();
  }
}
