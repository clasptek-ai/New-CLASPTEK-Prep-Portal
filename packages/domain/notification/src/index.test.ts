import { describe, it, expect } from 'vitest';
import {
  NotificationAggregate,
  NotificationPreference,
  NotificationId,
  DeliveryPolicy,
  RetryPolicy,
} from './index';

describe('Notification Domain Package — Comprehensive Lifecycle & Engine Verification', () => {
  it('enforces full 8-stage lifecycle state machine transitions', () => {
    const notification = new NotificationAggregate({
      id: 'notif-100',
      recipientId: 'user-1',
      category: 'Academic',
      title: 'Mock Assessment Ready',
      body: 'Your IELTS Speaking mock test is ready.',
    });

    expect(notification.status).toBe('CREATED');
    expect(notification.attempts).toBe(0);

    // 1. Created -> Queued
    notification.markQueued();
    expect(notification.status).toBe('QUEUED');

    // 2. Queued -> Processing
    notification.markProcessing();
    expect(notification.status).toBe('PROCESSING');
    expect(notification.attempts).toBe(1);

    // 3. Processing -> Delivered
    notification.markDelivered();
    expect(notification.status).toBe('DELIVERED');
    expect(notification.deliveredAt).toBeDefined();

    // 4. Delivered -> Read
    notification.markRead();
    expect(notification.status).toBe('READ');
    expect(notification.readAt).toBeDefined();

    // 5. Read -> Archived
    notification.markArchived();
    expect(notification.status).toBe('ARCHIVED');
    expect(notification.archivedAt).toBeDefined();
  });

  it('rejects invalid state machine transitions', () => {
    const notification = new NotificationAggregate({
      id: 'notif-101',
      recipientId: 'user-1',
      category: 'System',
      title: 'System Alert',
      body: 'Body',
    });

    // Cannot jump from CREATED directly to PROCESSING
    expect(() => notification.markProcessing()).toThrow(
      'Cannot process notification unless queued'
    );

    notification.markQueued();
    notification.markProcessing();
    notification.markDelivered();
    notification.markRead();
    notification.markArchived();

    // Cannot mark ARCHIVED notification as READ
    expect(() => notification.markRead()).toThrow('Cannot mark archived notification as read');
  });

  it('handles RetryPolicy and transitions to DEAD_LETTER after max retries', () => {
    const retryPolicy = new RetryPolicy(2, 60, 2);
    const notification = new NotificationAggregate({
      id: 'notif-retry',
      recipientId: 'user-1',
      category: 'Security',
      title: 'Failed Login',
      body: 'Security notification',
      retryPolicy,
    });

    // Attempt 1: Failed -> Retry
    notification.markQueued();
    notification.markProcessing();
    expect(notification.attempts).toBe(1);
    notification.markFailed();
    expect(notification.status).toBe('RETRY');

    // Attempt 2: Re-queued, Processing, Failed -> Dead Letter
    notification.markQueued();
    notification.markProcessing();
    expect(notification.attempts).toBe(2);
    notification.markFailed();
    expect(notification.status).toBe('DEAD_LETTER');
  });

  it('calculates exponential backoff in RetryPolicy', () => {
    const retryPolicy = new RetryPolicy(3, 100, 2);
    const nextRetry1 = retryPolicy.calculateNextRetry(1);
    const nextRetry2 = retryPolicy.calculateNextRetry(2);

    expect(nextRetry1.getTime()).toBeGreaterThan(Date.now());
    expect(nextRetry2.getTime()).toBeGreaterThan(nextRetry1.getTime());
  });

  it('supports all 4 Delivery Policies', () => {
    const immediate = new DeliveryPolicy('IMMEDIATE');
    const scheduled = new DeliveryPolicy('SCHEDULED', new Date(Date.now() + 3600000));
    const dailyDigest = new DeliveryPolicy('DAILY_DIGEST');
    const weeklyDigest = new DeliveryPolicy('WEEKLY_DIGEST');

    expect(immediate.type).toBe('IMMEDIATE');
    expect(scheduled.type).toBe('SCHEDULED');
    expect(dailyDigest.type).toBe('DAILY_DIGEST');
    expect(weeklyDigest.type).toBe('WEEKLY_DIGEST');

    expect(() => new DeliveryPolicy('SCHEDULED')).toThrow(
      'Scheduled delivery policy requires scheduledFor timestamp'
    );
  });

  it('evaluates NotificationPreference correctly for preset profiles', () => {
    const minimalPref = new NotificationPreference('user-2', 'MINIMAL');
    expect(minimalPref.isCategoryEnabled('Security')).toBe(true);
    expect(minimalPref.isCategoryEnabled('Academic')).toBe(false);

    const academicPref = new NotificationPreference('user-3', 'ACADEMIC_ONLY');
    expect(academicPref.isCategoryEnabled('Academic')).toBe(true);
    expect(academicPref.isCategoryEnabled('Security')).toBe(true);
    expect(academicPref.isCategoryEnabled('System')).toBe(false);
  });

  it('throws error when creating empty NotificationId', () => {
    expect(() => new NotificationId('')).toThrow('NotificationId cannot be empty');
  });
});
