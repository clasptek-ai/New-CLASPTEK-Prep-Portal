import {
  DatabasePool,
  PostgresNotificationRepository,
  PostgresAnnouncementRepository,
} from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  CreateNotificationHandler,
  ProcessNotificationQueueHandler,
  MarkNotificationReadHandler,
  GetNotificationsHandler,
  UpdateNotificationPreferencesHandler,
  GetNotificationPreferencesHandler,
  GetCommunicationAnalyticsHandler,
  GetAdminDashboardOperationsHandler,
} from '@clasptek/application-notification';
import {
  CreateAnnouncementHandler,
  PublishAnnouncementHandler,
  GetAnnouncementsHandler,
  BroadcastAnnouncementHandler,
} from '@clasptek/application-announcement';

export interface NotificationContext {
  createNotification: CreateNotificationHandler;
  processNotificationQueue: ProcessNotificationQueueHandler;
  markNotificationRead: MarkNotificationReadHandler;
  getNotifications: GetNotificationsHandler;
  updatePreferences: UpdateNotificationPreferencesHandler;
  getPreferences: GetNotificationPreferencesHandler;
  getAnalytics: GetCommunicationAnalyticsHandler;
  getAdminDashboard: GetAdminDashboardOperationsHandler;
  createAnnouncement: CreateAnnouncementHandler;
  publishAnnouncement: PublishAnnouncementHandler;
  getAnnouncements: GetAnnouncementsHandler;
  broadcastAnnouncement: BroadcastAnnouncementHandler;
}

let cachedContext: NotificationContext | null = null;

export function getNotificationContext(): NotificationContext {
  if (cachedContext) return cachedContext;

  const env = loadEnvironment(process.env);
  const logger = new ConsoleLogger('notification-context');
  const pool = new DatabasePool(env, logger);

  const notifRepo = new PostgresNotificationRepository(pool);
  const annRepo = new PostgresAnnouncementRepository(pool);

  cachedContext = {
    createNotification: new CreateNotificationHandler(notifRepo),
    processNotificationQueue: new ProcessNotificationQueueHandler(notifRepo),
    markNotificationRead: new MarkNotificationReadHandler(notifRepo),
    getNotifications: new GetNotificationsHandler(notifRepo),
    updatePreferences: new UpdateNotificationPreferencesHandler(notifRepo),
    getPreferences: new GetNotificationPreferencesHandler(notifRepo),
    getAnalytics: new GetCommunicationAnalyticsHandler(notifRepo),
    getAdminDashboard: new GetAdminDashboardOperationsHandler(notifRepo),
    createAnnouncement: new CreateAnnouncementHandler(annRepo),
    publishAnnouncement: new PublishAnnouncementHandler(annRepo),
    getAnnouncements: new GetAnnouncementsHandler(annRepo),
    broadcastAnnouncement: new BroadcastAnnouncementHandler(annRepo),
  };

  return cachedContext;
}
