import React from 'react';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Timeline, TimelineItem } from '../../../shared/ui/timeline/Timeline';
import { CheckCircle2, BookOpen, Award, FileText } from 'lucide-react';

export interface ActivityFeedWidgetProps {
  notificationsCount: number;
  state?: WidgetState;
  onRetry?: () => void;
}

export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  notificationsCount,
  state = 'SUCCESS',
  onRetry,
}) => {
  const activities = [
    {
      id: 'act-1',
      title: 'Completed Timed Writing Task 2 Drill',
      description: 'Scored 7.5 Band in Coherence & Lexical Resource',
      date: '2 hours ago',
      icon: <CheckCircle2 size={16} color="#34d399" />,
      isCompleted: true,
    },
    {
      id: 'act-2',
      title: 'Submitted IELTS Reading Diagnostic Drill',
      description: '38/40 questions answered correctly on Section 3 Academic Passage',
      date: 'Yesterday',
      icon: <FileText size={16} color="#38bdf8" />,
      isCompleted: true,
    },
    {
      id: 'act-3',
      title: 'Unlocked Achievement: 14-Day Study Streak',
      description: 'Maintained consecutive daily practice goal',
      date: '2 days ago',
      icon: <Award size={16} color="#fbbf24" />,
      isCompleted: true,
    },
    {
      id: 'act-4',
      title: 'Completed Module: Academic Monologue Note-Taking',
      description: 'Passed listening module evaluation with 92% accuracy',
      date: '3 days ago',
      icon: <BookOpen size={16} color="#a78bfa" />,
      isCompleted: true,
    },
  ];

  return (
    <DashboardWidget
      title="Recent Academic Activity Feed"
      subtitle="Chronological stream of completed drills, diagnostic submissions, and lesson achievements"
      badge={`${activities.length} Recent`}
      badgeColor="#34d399"
      state={state}
      onRetry={onRetry}
    >
      <div style={{ padding: '0.5rem 0' }}>
        <Timeline>
          {activities.map((act) => (
            <TimelineItem
              key={act.id}
              date={act.date}
              title={act.title}
              description={act.description}
              icon={act.icon}
              isCompleted={act.isCompleted}
            />
          ))}
        </Timeline>
      </div>
    </DashboardWidget>
  );
};
