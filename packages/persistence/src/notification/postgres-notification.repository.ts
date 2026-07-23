import { Pool } from 'pg';
import {
  NotificationAggregate,
  NotificationPreference,
  NotificationRepository,
  CommunicationAnalytics,
  AdminDashboardOperations,
} from '@clasptek/domain-notification';
import {
  AnnouncementAggregate,
  AnnouncementRepository,
  Broadcast,
} from '@clasptek/domain-announcement';

export class PostgresNotificationRepository implements NotificationRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | any) {
    this.pool = poolOrDbPool.pool || poolOrDbPool;
  }

  public async save(notification: NotificationAggregate): Promise<void> {
    const query = `
      INSERT INTO notifications (
        id, recipient_id, category, priority, title, body, status, channel, metadata, created_at, updated_at, delivered_at, read_at, archived_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at,
        delivered_at = EXCLUDED.delivered_at,
        read_at = EXCLUDED.read_at,
        archived_at = EXCLUDED.archived_at;
    `;
    await this.pool.query(query, [
      notification.id,
      notification.recipientId,
      notification.category,
      notification.priority,
      notification.title,
      notification.body,
      notification.status,
      notification.channel,
      JSON.stringify(notification.metadata),
      notification.createdAt,
      notification.updatedAt,
      notification.deliveredAt || null,
      notification.readAt || null,
      notification.archivedAt || null,
    ]);
  }

  public async findById(id: string): Promise<NotificationAggregate | null> {
    const query = `SELECT * FROM notifications WHERE id = $1;`;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this.mapToAggregate(res.rows[0]);
  }

  public async findByRecipient(recipientId: string): Promise<NotificationAggregate[]> {
    const query = `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC;`;
    const res = await this.pool.query(query, [recipientId]);
    return res.rows.map((r) => this.mapToAggregate(r));
  }

  public async savePreference(pref: NotificationPreference): Promise<void> {
    const query = `
      INSERT INTO notification_preferences (
        user_id, preset_profile, enabled_categories, channel_settings, digest_frequency, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        preset_profile = EXCLUDED.preset_profile,
        enabled_categories = EXCLUDED.enabled_categories,
        channel_settings = EXCLUDED.channel_settings,
        digest_frequency = EXCLUDED.digest_frequency,
        updated_at = NOW();
    `;
    await this.pool.query(query, [
      pref.userId,
      pref.presetProfile,
      JSON.stringify(pref.enabledCategories),
      JSON.stringify(pref.channelSettings),
      pref.digestFrequency,
    ]);
  }

  public async getPreference(userId: string): Promise<NotificationPreference | null> {
    const query = `SELECT * FROM notification_preferences WHERE user_id = $1;`;
    const res = await this.pool.query(query, [userId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return new NotificationPreference(
      row.user_id,
      row.preset_profile,
      row.enabled_categories,
      row.channel_settings,
      row.digest_frequency
    );
  }

  public async getAnalytics(): Promise<CommunicationAnalytics> {
    const res = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'DELIVERED' OR status = 'READ' OR status = 'ARCHIVED') as delivered,
        COUNT(*) FILTER (WHERE status = 'READ' OR status = 'ARCHIVED') as read_count,
        COUNT(*) FILTER (WHERE status = 'FAILED' OR status = 'DEAD_LETTER') as failed_count
      FROM notifications;
    `);
    const r = res.rows[0] || {};
    const total = parseInt(r.total || '0', 10);
    const delivered = parseInt(r.delivered || '0', 10);
    const readCount = parseInt(r.read_count || '0', 10);
    const failedCount = parseInt(r.failed_count || '0', 10);

    return {
      totalSent: total,
      totalDelivered: delivered,
      totalRead: readCount,
      totalFailed: failedCount,
      deliveryRatePercentage: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 100,
      readRatePercentage: delivered > 0 ? Number(((readCount / delivered) * 100).toFixed(1)) : 100,
      queueThroughputPerMinute: 300,
      channelUtilisation: { IN_APP: total, EMAIL: 0, SMS: 0, WHATSAPP: 0, PUSH: 0 },
    };
  }

  public async getAdminDashboard(): Promise<AdminDashboardOperations> {
    const res = await this.pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'QUEUED') as pending,
        COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing,
        COUNT(*) FILTER (WHERE status = 'DELIVERED') as delivered,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
        COUNT(*) FILTER (WHERE status = 'RETRY') as retry_queue,
        COUNT(*) FILTER (WHERE status = 'DEAD_LETTER') as dead_letter
      FROM notifications;
    `);
    const r = res.rows[0] || {};
    return {
      pendingCount: parseInt(r.pending || '0', 10),
      processingCount: parseInt(r.processing || '0', 10),
      deliveredCount: parseInt(r.delivered || '0', 10),
      failedCount: parseInt(r.failed || '0', 10),
      retryQueueLength: parseInt(r.retry_queue || '0', 10),
      deadLetterCount: parseInt(r.dead_letter || '0', 10),
      channelHealth: {
        IN_APP: 'HEALTHY',
        EMAIL: 'DISABLED',
        SMS: 'DISABLED',
        WHATSAPP: 'DISABLED',
        PUSH: 'DISABLED',
      },
    };
  }

  private mapToAggregate(row: any): NotificationAggregate {
    return new NotificationAggregate({
      id: row.id,
      recipientId: row.recipient_id,
      category: row.category,
      priority: row.priority,
      title: row.title,
      body: row.body,
      status: row.status,
      channel: row.channel,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      ...(row.delivered_at ? { deliveredAt: new Date(row.delivered_at) } : {}),
      ...(row.read_at ? { readAt: new Date(row.read_at) } : {}),
      ...(row.archived_at ? { archivedAt: new Date(row.archived_at) } : {}),
    });
  }
}

export class PostgresAnnouncementRepository implements AnnouncementRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | any) {
    this.pool = poolOrDbPool.pool || poolOrDbPool;
  }

  public async save(announcement: AnnouncementAggregate): Promise<void> {
    const query = `
      INSERT INTO announcements (
        id, title, content, author_id, status, audience_target, effective_at, expires_at, version, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        version = EXCLUDED.version,
        updated_at = EXCLUDED.updated_at;
    `;
    await this.pool.query(query, [
      announcement.id,
      announcement.title,
      announcement.content,
      announcement.authorId,
      announcement.status,
      JSON.stringify(announcement.audienceTarget),
      announcement.effectiveAt || null,
      announcement.expiresAt || null,
      announcement.version,
      announcement.createdAt,
      announcement.updatedAt,
    ]);
  }

  public async findById(id: string): Promise<AnnouncementAggregate | null> {
    const query = `SELECT * FROM announcements WHERE id = $1;`;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this.mapToAggregate(res.rows[0]);
  }

  public async findPublished(): Promise<AnnouncementAggregate[]> {
    const query = `SELECT * FROM announcements WHERE status = 'PUBLISHED' ORDER BY created_at DESC;`;
    const res = await this.pool.query(query, []);
    return res.rows.map((r) => this.mapToAggregate(r));
  }

  public async recordBroadcast(broadcast: Broadcast): Promise<void> {
    const query = `
      INSERT INTO broadcasts (
        id, announcement_id, sent_by, audience_summary, total_recipients, broadcast_at
      ) VALUES ($1, $2, $3, $4, $5, $6);
    `;
    await this.pool.query(query, [
      broadcast.id,
      broadcast.announcementId,
      broadcast.sentBy,
      JSON.stringify(broadcast.audienceSummary),
      broadcast.totalRecipients,
      broadcast.broadcastAt,
    ]);
  }

  private mapToAggregate(row: any): AnnouncementAggregate {
    return new AnnouncementAggregate({
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      status: row.status,
      audienceTarget: row.audience_target,
      ...(row.effective_at ? { effectiveAt: new Date(row.effective_at) } : {}),
      ...(row.expires_at ? { expiresAt: new Date(row.expires_at) } : {}),
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
