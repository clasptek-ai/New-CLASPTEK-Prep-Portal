import { describe, it, expect, vi } from 'vitest';
import {
  PostgresNotificationRepository,
  PostgresAnnouncementRepository,
} from './postgres-notification.repository';
import { NotificationAggregate } from '@clasptek/domain-notification';
import { AnnouncementAggregate } from '@clasptek/domain-announcement';

describe('PostgresNotificationRepository', () => {
  it('saves notification to postgres pool', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const poolMock = { query: queryMock } as any;

    const repo = new PostgresNotificationRepository(poolMock);
    const notif = new NotificationAggregate({
      id: 'notif-99',
      recipientId: 'user-99',
      category: 'System',
      title: 'Security Notice',
      body: 'New login detected.',
    });

    await repo.save(notif);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO notifications');
    expect(queryMock.mock.calls[0][1][0]).toBe('notif-99');
  });

  it('saves announcement to postgres pool', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const poolMock = { query: queryMock } as any;

    const repo = new PostgresAnnouncementRepository(poolMock);
    const ann = new AnnouncementAggregate({
      id: 'ann-99',
      title: 'Welcome Banner',
      content: 'Welcome to Clasptek V2!',
      authorId: 'admin-99',
    });

    await repo.save(ann);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO announcements');
    expect(queryMock.mock.calls[0][1][0]).toBe('ann-99');
  });
});
