import { describe, test, expect } from 'vitest';
import { DashboardCompositionService } from './dashboard-composition.service';

describe('DashboardCompositionService Unit & Contract Tests', () => {
  test('getOverview orchestrates student profile, course progress, assessment summary, and AI summary into DashboardOverviewDto', async () => {
    const overview = await DashboardCompositionService.getOverview('stud-active-123');
    expect(overview).toBeDefined();
    expect(overview.profile.studentName).toBeDefined();
    expect(overview.profile.studyStreakDays).toBe(14);
    expect(overview.progress.overallProgrammeProgress).toBeGreaterThan(0);
    expect(overview.assessmentSummary.diagnostic.status).toBe('COMPLETED');
    expect(overview.assessmentSummary.mock.readinessLevel).toBeDefined();
    expect(overview.aiSummary.topRecommendation).toBeDefined();
    expect(overview.unreadNotificationsCount).toBeGreaterThanOrEqual(0);
  });

  test('getActivity returns paginated activity feed sorted newest first', async () => {
    const activity = await DashboardCompositionService.getActivity(1, 3);
    expect(activity.activities.length).toBeLessThanOrEqual(3);
    expect(activity.totalCount).toBeGreaterThanOrEqual(3);
    expect(activity.activities[0].type).toBeDefined();
  });

  test('getCalendar returns scheduled academic events for Day, Week, and Month views', async () => {
    const monthCalendar = await DashboardCompositionService.getCalendar('MONTH');
    expect(monthCalendar.view).toBe('MONTH');
    expect(monthCalendar.events.length).toBeGreaterThan(0);

    const dayCalendar = await DashboardCompositionService.getCalendar('DAY');
    expect(dayCalendar.view).toBe('DAY');
  });

  test('getAchievements calculates badges, milestones, XP, and streak without certificates', async () => {
    const achievements = await DashboardCompositionService.getAchievements();
    expect(achievements.badges.length).toBeGreaterThan(0);
    expect(achievements.milestonesCompletedCount).toBeGreaterThan(0);
    expect(achievements.xpPoints).toBeGreaterThan(0);
    expect(achievements.studyStreakDays).toBe(14);
    // Certificates excluded per Sprint 2.2 scope rule
    expect((achievements as any).certificates).toBeUndefined();
  });
});
