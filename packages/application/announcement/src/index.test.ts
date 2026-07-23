import { describe, it, expect, vi } from 'vitest';
import {
  CreateAnnouncementHandler,
  PublishAnnouncementHandler,
  GetAnnouncementsHandler,
  BroadcastAnnouncementHandler,
} from './index';
import { AnnouncementAggregate } from '@clasptek/domain-announcement';

describe('Application Announcement Package', () => {
  it('creates and publishes an announcement', async () => {
    let saved: AnnouncementAggregate | null = null;

    const mockRepo = {
      save: vi.fn().mockImplementation(async (ann) => {
        saved = ann;
      }),
      findById: vi.fn().mockImplementation(async () => saved),
      findPublished: vi.fn().mockImplementation(async () => (saved ? [saved] : [])),
      recordBroadcast: vi.fn().mockResolvedValue(undefined),
    };

    const createHandler = new CreateAnnouncementHandler(mockRepo as any);
    const id = await createHandler.execute({
      title: 'Platform Maintenance',
      content: 'Server update scheduled.',
      authorId: 'admin-1',
    });

    expect(id).toContain('ann-');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);

    const publishHandler = new PublishAnnouncementHandler(mockRepo as any);
    await publishHandler.execute(id);

    expect(saved!.status).toBe('PUBLISHED');

    const getHandler = new GetAnnouncementsHandler(mockRepo as any);
    const list = await getHandler.execute();
    expect(list).toHaveLength(1);
  });

  it('records broadcast for announcement', async () => {
    const ann = new AnnouncementAggregate({
      id: 'ann-50',
      title: 'System Alert',
      content: 'Important update.',
      authorId: 'admin-1',
    });

    const mockRepo = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(ann),
      findPublished: vi.fn(),
      recordBroadcast: vi.fn().mockResolvedValue(undefined),
    };

    const broadcastHandler = new BroadcastAnnouncementHandler(mockRepo as any);
    const bcastId = await broadcastHandler.execute({
      announcementId: 'ann-50',
      sentBy: 'admin-1',
      totalRecipients: 250,
    });

    expect(bcastId).toContain('bcast-');
    expect(mockRepo.recordBroadcast).toHaveBeenCalledTimes(1);
  });
});
