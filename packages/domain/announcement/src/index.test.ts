import { describe, it, expect } from 'vitest';
import { AnnouncementAggregate, Broadcast } from './index';

describe('Announcement Domain Package', () => {
  it('publishes and manages publication lifecycle', () => {
    const ann = new AnnouncementAggregate({
      id: 'ann-1',
      title: 'Scheduled Maintenance',
      content: 'System will be updated tonight.',
      authorId: 'admin-1',
    });

    expect(ann.status).toBe('DRAFT');
    expect(ann.isVisibleAt()).toBe(false);

    ann.publish();
    expect(ann.status).toBe('PUBLISHED');
    expect(ann.isVisibleAt()).toBe(true);

    ann.expire();
    expect(ann.status).toBe('EXPIRED');
    expect(ann.isVisibleAt()).toBe(false);
  });

  it('instantiates Broadcast correctly', () => {
    const bcast = new Broadcast({
      id: 'bc-1',
      announcementId: 'ann-1',
      sentBy: 'admin-1',
      audienceSummary: { type: 'ALL' },
      totalRecipients: 500,
    });

    expect(bcast.totalRecipients).toBe(500);
    expect(bcast.sentBy).toBe('admin-1');
  });
});
