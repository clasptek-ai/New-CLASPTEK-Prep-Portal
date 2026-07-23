'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStudentWorkspace } from '../../workspace/StudentWorkspaceContext';
import { useDashboardSummary } from './use-dashboard-queries';
import { QueryStateWrapper } from '../../components/ui/query-state-wrapper';

import { LearningPaceSelector } from '../../components/ui/learning-pace-selector';
import { ExamTargetWidget } from '../../components/ui/exam-target-widget';
import { ReadinessGaugeWidget } from '../../components/ui/readiness-gauge-widget';
import { InterventionAlertWidget } from '../../components/ui/intervention-alert-widget';

import { DashboardHero } from './components/dashboard-hero';
import { ProgressOverview } from './components/progress-overview';
import { TodayTasks } from './components/today-tasks';
import { UpcomingMockCard } from './components/upcoming-mock-card';
import { RecentPractice } from './components/recent-practice';

export function DashboardScreen() {
  const router = useRouter();
  const { student, programme, readiness } = useStudentWorkspace();
  const { data: dashboardData, isLoading, isError, error, refetch } = useDashboardSummary();

  if (!student || !programme || !readiness) {
    return null;
  }

  const stats = dashboardData?.stats;

  return (
    <QueryStateWrapper isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
      {dashboardData && stats && (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
          {/* Step 3: Hero Header Banner */}
          <DashboardHero
            studentName={student.name}
            programmeName={programme.name}
            currentModule={programme.currentModule}
            learningProgress={stats.learningProgress}
            targetScore={readiness.targetScore}
            daysRemaining={95}
          />

          {/* Academic Intervention Alert */}
          <InterventionAlertWidget
            interventions={[
              {
                id: 'si-demo-1',
                ruleCode: 'RULE_TARGET_EXAM_APPROACHING',
                interventionType: 'TARGET_EXAM_ALERT',
                status: 'ACTIVE',
                title: 'Revision Window Active',
                description: 'Your target exam is in 95 days. Recommended to schedule mock exams.',
                triggerReason: 'Target Exam Date approaching',
                actionRecommended: 'Schedule Mock Examination',
                createdAt: new Date(),
              },
            ]}
          />

          {/* Enhancements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LearningPaceSelector currentPace="Accelerated" weeklyHours={18} />
            <ExamTargetWidget
              daysRemaining={95}
              weeksRemaining={14}
              targetScore={7.5}
              registrationStatus="REGISTERED"
              scheduleCalculations={{
                lessonsPerWeek: 4,
                practiceSessionsPerWeek: 6,
                mockIntervalWeeks: 2,
                revisionWindowDays: 14,
              }}
            />
            <ReadinessGaugeWidget
              readinessScore={stats.readinessScore}
              readinessLevel="NEARLY_READY"
            />
          </div>

          {/* Step 5: KPI Progress Overview */}
          <ProgressOverview
            stats={{
              learningProgress: stats.learningProgress,
              practiceAccuracy: stats.practiceAccuracy,
              mockAverage: stats.mockAverage,
              readinessScore: stats.readinessScore,
              estimatedWeeksLeft: programme.estimatedCompletionWeeks,
              targetScore: readiness.targetScore,
            }}
          />

          {/* Today's Tasks & Upcoming Deadlines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayTasks
              recommendations={dashboardData.recommendations}
              onAction={() => router.push('/practice')}
            />
            <UpcomingMockCard deadlines={dashboardData.upcomingDeadlines} />
          </div>

          {/* Recent Activity & Notifications Stream */}
          <RecentPractice
            activities={dashboardData.activities}
            notifications={dashboardData.notifications}
          />
        </div>
      )}
    </QueryStateWrapper>
  );
}

export default DashboardScreen;
