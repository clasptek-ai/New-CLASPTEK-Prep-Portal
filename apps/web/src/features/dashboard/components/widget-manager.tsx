'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardViewModel } from '../hooks/use-dashboard-view-model';
import { HeroWidget } from '../widgets/hero-widget';
import { LearningProgressWidget } from '../widgets/learning-progress-widget';
import { TodaysLearningWidget } from '../widgets/todays-learning-widget';
import { UpcomingAssessmentsWidget } from '../widgets/upcoming-assessments-widget';
import { ActivityFeedWidget } from '../widgets/activity-feed-widget';
import { AchievementsWidget } from '../widgets/achievements-widget';

export interface WidgetManagerProps {
  viewModel: DashboardViewModel;
}

export const WidgetManager: React.FC<WidgetManagerProps> = ({ viewModel }) => {
  const router = useRouter();

  const {
    config,
    studentName,
    studyStreakDays,
    activeNotificationsCount,
    isLoading,
    isError,
    handleQuickAction: _handleQuickAction,
    refetch,
  } = viewModel;

  const widgetState = isLoading ? 'LOADING' : isError ? 'ERROR' : 'SUCCESS';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        paddingBottom: '2rem',
      }}
    >
      {/* ── Zone 1: Welcome + Programme + Next Action ── */}
      <HeroWidget
        studentName={studentName}
        config={config}
        studyStreakDays={studyStreakDays}
        state={widgetState}
        onRetry={refetch}
        onResumeLearning={() => router.push('/learning')}
      />

      {/* ── Zone 2: Progress (2-column grid on wider viewports) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <LearningProgressWidget config={config} state={widgetState} onRetry={refetch} />

        {/* Today's Learning — continues on the right */}
        <TodaysLearningWidget
          config={config}
          state={widgetState}
          onRetry={refetch}
          onSelectLesson={(lessonId) => router.push(`/learning?lessonId=${lessonId}`)}
        />
      </div>

      {/* ── Zone 3: Upcoming Assessments ── */}
      <UpcomingAssessmentsWidget
        config={config}
        state={widgetState}
        onRetry={refetch}
        onLaunchDiagnostic={() => router.push('/student/welcome')}
        onLaunchMock={() => router.push('/student/mock')}
      />

      {/* ── Zone 4: Activity + Achievements (compact 2-column) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <ActivityFeedWidget
          notificationsCount={activeNotificationsCount}
          state={widgetState}
          onRetry={refetch}
        />

        <AchievementsWidget
          config={config}
          studyStreakDays={studyStreakDays}
          state={widgetState}
          onRetry={refetch}
        />
      </div>
    </div>
  );
};
