import { describe, it, expect, vi } from 'vitest';
import {
  CreateNotificationHandler,
  ProcessNotificationQueueHandler,
  MarkNotificationReadHandler,
  GetCommunicationAnalyticsHandler,
  GetAdminDashboardOperationsHandler,
} from './index';
import { NotificationAggregate, NotificationPreference } from '@clasptek/domain-notification';

describe('Application Notification Package — CQRS Handlers Test Suite', () => {
  it('creates notification in QUEUED state and filters by preferences', async () => {
    let saved: NotificationAggregate | null = null;
    const mockRepo = {
      save: vi.fn().mockImplementation(async (n) => {
        saved = n;
      }),
      findById: vi.fn(),
      findByRecipient: vi.fn(),
      savePreference: vi.fn(),
      getPreference: vi.fn().mockResolvedValue(new NotificationPreference('user-1', 'EVERYTHING')),
      getAnalytics: vi.fn(),
      getAdminDashboard: vi.fn(),
    };

    const handler = new CreateNotificationHandler(mockRepo as any);
    const id = await handler.execute({
      recipientId: 'user-1',
      category: 'Academic',
      title: 'New Score Published',
      body: 'Your IELTS Speaking result is ready',
    });

    expect(id).toContain('notif-');
    expect(saved!.status).toBe('QUEUED');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('processes queued notification through PROCESSING to DELIVERED state', async () => {
    const notif = new NotificationAggregate({
      id: 'notif-q1',
      recipientId: 'user-1',
      category: 'Academic',
      title: 'Title',
      body: 'Body',
      status: 'QUEUED',
    });

    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(notif),
      findByRecipient: vi.fn(),
      savePreference: vi.fn(),
      getPreference: vi.fn(),
      getAnalytics: vi.fn(),
      getAdminDashboard: vi.fn(),
    };

    const handler = new ProcessNotificationQueueHandler(mockRepo as any);
    await handler.execute('notif-q1');

    expect(notif.status).toBe('DELIVERED');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('marks notification as read by authorized recipient', async () => {
    const notif = new NotificationAggregate({
      id: 'notif-1',
      recipientId: 'user-1',
      category: 'Academic',
      title: 'Title',
      body: 'Body',
      status: 'DELIVERED',
    });

    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(notif),
      findByRecipient: vi.fn(),
      savePreference: vi.fn(),
      getPreference: vi.fn(),
      getAnalytics: vi.fn(),
      getAdminDashboard: vi.fn(),
    };

    const handler = new MarkNotificationReadHandler(mockRepo as any);
    await handler.execute('notif-1', 'user-1');

    expect(notif.status).toBe('READ');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('fetches communication analytics projection', async () => {
    const mockAnalytics = {
      totalSent: 1500,
      totalDelivered: 1475,
      totalRead: 1200,
      totalFailed: 25,
      deliveryRatePercentage: 98.3,
      readRatePercentage: 81.3,
      queueThroughputPerMinute: 350,
      channelUtilisation: { IN_APP: 1500, EMAIL: 0, SMS: 0, WHATSAPP: 0, PUSH: 0 },
    };

    const mockRepo = {
      getAnalytics: vi.fn().mockResolvedValue(mockAnalytics),
    };

    const handler = new GetCommunicationAnalyticsHandler(mockRepo as any);
    const result = await handler.execute();

    expect(result.deliveryRatePercentage).toBe(98.3);
    expect(result.queueThroughputPerMinute).toBe(350);
  });

  it('fetches admin dashboard operations projection', async () => {
    const mockDashboard = {
      pendingCount: 45,
      processingCount: 12,
      deliveredCount: 1475,
      failedCount: 25,
      retryQueueLength: 8,
      deadLetterCount: 2,
      channelHealth: {
        IN_APP: 'HEALTHY',
        EMAIL: 'DISABLED',
        SMS: 'DISABLED',
        WHATSAPP: 'DISABLED',
        PUSH: 'DISABLED',
      },
    };

    const mockRepo = {
      getAdminDashboard: vi.fn().mockResolvedValue(mockDashboard),
    };

    const handler = new GetAdminDashboardOperationsHandler(mockRepo as any);
    const result = await handler.execute();

    expect(result.pendingCount).toBe(45);
    expect(result.retryQueueLength).toBe(8);
  });
});
