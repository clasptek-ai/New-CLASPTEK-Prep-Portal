import { describe, it, expect, vi } from 'vitest';
import { GET as getNotifications } from './route';
import { PATCH as markRead } from './[id]/read/route';
import { GET as getAnnouncements } from '../announcements/route';
import { POST as postBroadcast } from '../broadcasts/route';
import { GET as getPreferences, PATCH as updatePreferences } from '../preferences/route';
import { GET as getAnalytics } from './analytics/route';
import { GET as getAdminDashboard } from './admin-dashboard/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/notification-context', () => {
  return {
    getNotificationContext: () => ({
      getNotifications: {
        execute: async (recipientId: string) => [
          {
            id: 'notif-1',
            recipientId,
            category: 'Academic',
            priority: 'NORMAL',
            title: 'Mock Ready',
            body: 'Speaking mock is graded.',
            status: 'DELIVERED',
            channel: 'IN_APP',
            createdAt: new Date(),
          },
        ],
      },
      markNotificationRead: {
        execute: async () => {},
      },
      getAnnouncements: {
        execute: async () => [
          {
            id: 'ann-1',
            title: 'Maintenance',
            content: 'Scheduled for midnight',
            authorId: 'admin-1',
            status: 'PUBLISHED',
            createdAt: new Date(),
          },
        ],
      },
      broadcastAnnouncement: {
        execute: async () => 'bcast-123',
      },
      getPreferences: {
        execute: async (userId: string) => ({
          userId,
          presetProfile: 'EVERYTHING',
          enabledCategories: ['Academic', 'Security'],
        }),
      },
      updatePreferences: {
        execute: async (cmd: any) => ({
          userId: cmd.userId,
          presetProfile: cmd.presetProfile || 'EVERYTHING',
          enabledCategories: cmd.enabledCategories || ['Academic'],
        }),
      },
      getAnalytics: {
        execute: async () => ({
          totalSent: 1500,
          totalDelivered: 1475,
          totalRead: 1200,
          totalFailed: 25,
          deliveryRatePercentage: 98.3,
          readRatePercentage: 81.3,
          queueThroughputPerMinute: 350,
          channelUtilisation: { IN_APP: 1500, EMAIL: 0, SMS: 0, WHATSAPP: 0, PUSH: 0 },
        }),
      },
      getAdminDashboard: {
        execute: async () => ({
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
        }),
      },
    }),
  };
});

describe('Sprint 3.10 Notifications & Communication REST API Routes', () => {
  it('GET /api/v1/notifications fetches recipient notifications', async () => {
    const req = new NextRequest('http://localhost/api/v1/notifications?recipientId=user-1');
    const res = await getNotifications(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Mock Ready');
  });

  it('PATCH /api/v1/notifications/[id]/read marks notification read', async () => {
    const req = new NextRequest('http://localhost/api/v1/notifications/notif-1/read', {
      method: 'PATCH',
      body: JSON.stringify({ recipientId: 'user-1' }),
    });
    const res = await markRead(req, { params: Promise.resolve({ id: 'notif-1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('GET /api/v1/announcements returns active published announcements', async () => {
    const res = await getAnnouncements();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data[0].title).toBe('Maintenance');
  });

  it('POST /api/v1/broadcasts broadcasts an announcement', async () => {
    const req = new NextRequest('http://localhost/api/v1/broadcasts', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1', sentBy: 'admin-1' }),
    });
    const res = await postBroadcast(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.broadcastId).toBe('bcast-123');
  });

  it('GET and PATCH /api/v1/preferences manage preference settings', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/preferences?userId=user-1');
    const getRes = await getPreferences(getReq);
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.data.presetProfile).toBe('EVERYTHING');

    const patchReq = new NextRequest('http://localhost/api/v1/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ userId: 'user-1', presetProfile: 'ACADEMIC_ONLY' }),
    });
    const patchRes = await updatePreferences(patchReq);
    expect(patchRes.status).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.data.presetProfile).toBe('ACADEMIC_ONLY');
  });

  it('GET /api/v1/notifications/analytics returns communication analytics', async () => {
    const res = await getAnalytics();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.deliveryRatePercentage).toBe(98.3);
  });

  it('GET /api/v1/notifications/admin-dashboard returns operations dashboard metrics', async () => {
    const res = await getAdminDashboard();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.pendingCount).toBe(45);
    expect(body.data.retryQueueLength).toBe(8);
  });
});
