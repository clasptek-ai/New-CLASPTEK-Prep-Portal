'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardViewModel } from '../hooks/use-dashboard-view-model';
import { HeroWidget } from '../widgets/hero-widget';
import { AICoachWidget } from '../widgets/ai-coach-widget';
import { LearningProgressWidget } from '../widgets/learning-progress-widget';
import { TodaysLearningWidget } from '../widgets/todays-learning-widget';
import { UpcomingAssessmentsWidget } from '../widgets/upcoming-assessments-widget';
import { ActivityFeedWidget } from '../widgets/activity-feed-widget';
import { AcademicCalendarWidget } from '../widgets/academic-calendar-widget';
import { AchievementsWidget } from '../widgets/achievements-widget';
import { QuickActionsWidget } from '../widgets/quick-actions-widget';

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
    handleQuickAction,
    refetch,
  } = viewModel;

  const widgetState = isLoading ? 'LOADING' : isError ? 'ERROR' : 'SUCCESS';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Zone 1: Hero & Profile Summary */}
      <HeroWidget
        studentName={studentName}
        config={config}
        studyStreakDays={studyStreakDays}
        state={widgetState}
        onRetry={refetch}
        onResumeLearning={() => router.push('/learning')}
      />

      {/* Zone 4: AI Academic Coach Preview (Plugin Slot) */}
      <AICoachWidget
        config={config}
        state={widgetState}
        onRetry={refetch}
        onLaunchAssistant={() => router.push('/learning-assistant')}
      />

      {/* Zone 2: Learning & Skills Mastery */}
      <LearningProgressWidget config={config} state={widgetState} onRetry={refetch} />

      {/* Zone 3: Today's Learning & Recommended Practice */}
      <TodaysLearningWidget
        config={config}
        state={widgetState}
        onRetry={refetch}
        onSelectLesson={(lessonId) => router.push(`/learning?lessonId=${lessonId}`)}
      />

      {/* Zone 5: Upcoming Assessments & Mock Examinations */}
      <UpcomingAssessmentsWidget
        config={config}
        state={widgetState}
        onRetry={refetch}
        onLaunchDiagnostic={() => router.push('/student/welcome')}
        onLaunchMock={() => router.push('/student/mock')}
      />

      {/* Zone 6 & Zone 7 Layout Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Zone 6: Activity Feed */}
        <ActivityFeedWidget
          notificationsCount={activeNotificationsCount}
          state={widgetState}
          onRetry={refetch}
        />

        {/* Zone 7: Academic Calendar */}
        <AcademicCalendarWidget config={config} state={widgetState} onRetry={refetch} />
      </div>

      {/* Zone 8: Achievements & Badges */}
      <AchievementsWidget
        config={config}
        studyStreakDays={studyStreakDays}
        state={widgetState}
        onRetry={refetch}
      />

      {/* Zone 9: Quick Actions & Academic Drills */}
      <QuickActionsWidget
        config={config}
        state={widgetState}
        onRetry={refetch}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};
