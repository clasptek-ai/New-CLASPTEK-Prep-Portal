import {
  AnnouncementAggregate,
  AnnouncementRepository,
  AudienceTarget,
  Broadcast,
} from '@clasptek/domain-announcement';

export interface CreateAnnouncementCommand {
  title: string;
  content: string;
  authorId: string;
  audienceTarget?: AudienceTarget;
  effectiveAt?: Date;
  expiresAt?: Date;
}

export class CreateAnnouncementHandler {
  constructor(private readonly repo: AnnouncementRepository) {}

  public async execute(cmd: CreateAnnouncementCommand): Promise<string> {
    const id = `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const announcement = new AnnouncementAggregate({
      id,
      title: cmd.title,
      content: cmd.content,
      authorId: cmd.authorId,
      ...(cmd.audienceTarget !== undefined ? { audienceTarget: cmd.audienceTarget } : {}),
      ...(cmd.effectiveAt !== undefined ? { effectiveAt: cmd.effectiveAt } : {}),
      ...(cmd.expiresAt !== undefined ? { expiresAt: cmd.expiresAt } : {}),
    });

    await this.repo.save(announcement);
    return id;
  }
}

export class PublishAnnouncementHandler {
  constructor(private readonly repo: AnnouncementRepository) {}

  public async execute(id: string): Promise<void> {
    const ann = await this.repo.findById(id);
    if (!ann) throw new Error('Announcement not found');

    ann.publish();
    await this.repo.save(ann);
  }
}

export class GetAnnouncementsHandler {
  constructor(private readonly repo: AnnouncementRepository) {}

  public async execute(): Promise<AnnouncementAggregate[]> {
    const all = await this.repo.findPublished();
    const now = new Date();
    return all.filter((a) => a.isVisibleAt(now));
  }
}

export interface BroadcastAnnouncementCommand {
  announcementId: string;
  sentBy: string;
  audienceSummary?: Record<string, any>;
  totalRecipients?: number;
}

export class BroadcastAnnouncementHandler {
  constructor(private readonly repo: AnnouncementRepository) {}

  public async execute(cmd: BroadcastAnnouncementCommand): Promise<string> {
    const ann = await this.repo.findById(cmd.announcementId);
    if (!ann) throw new Error('Announcement not found');

    if (ann.status !== 'PUBLISHED') {
      ann.publish();
      await this.repo.save(ann);
    }

    const broadcastId = `bcast-${Date.now()}`;
    const broadcast = new Broadcast({
      id: broadcastId,
      announcementId: cmd.announcementId,
      sentBy: cmd.sentBy,
      audienceSummary: cmd.audienceSummary || ann.audienceTarget,
      totalRecipients: cmd.totalRecipients || 100,
    });

    await this.repo.recordBroadcast(broadcast);
    return broadcastId;
  }
}
