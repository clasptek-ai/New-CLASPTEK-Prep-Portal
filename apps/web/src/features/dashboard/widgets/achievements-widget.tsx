import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Flame, Award, ShieldCheck, Zap, Trophy, Medal } from 'lucide-react';
import { ProgressBar } from '../../../shared/ui/progress/ProgressBar';

export interface AchievementsWidgetProps {
  config: ProgrammeConfiguration;
  studyStreakDays: number;
  state?: WidgetState;
  onRetry?: () => void;
}

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({
  config,
  studyStreakDays,
  state = 'SUCCESS',
  onRetry,
}) => {
  const achievements = [
    {
      id: 'ach-1',
      title: '14-Day Study Streak',
      subtitle: 'Maintained consecutive daily practice goal',
      icon: <Flame size={20} color="#f59e0b" fill="#f59e0b" />,
      unlocked: true,
      progress: 100,
    },
    {
      id: 'ach-2',
      title: 'Band 7.5 Jump',
      subtitle: 'Achieved predicted 7.5 Band overall in IELTS Academic',
      icon: <Trophy size={20} color="#3b82f6" />,
      unlocked: true,
      progress: 100,
    },
    {
      id: 'ach-3',
      title: 'Diagnostic Master',
      subtitle: 'Completed initial baseline diagnostic evaluation',
      icon: <ShieldCheck size={20} color="#34d399" />,
      unlocked: true,
      progress: 100,
    },
    {
      id: 'ach-4',
      title: 'Writing Task 2 Specialist',
      subtitle: 'Complete 10 essay evaluations with AI feedback',
      icon: <Medal size={20} color="#a78bfa" />,
      unlocked: false,
      progress: 60,
    },
  ];

  return (
    <DashboardWidget
      title="Academic Achievements & Badges"
      subtitle="Milestone recognitions earned through consistent study discipline"
      badge={`${achievements.filter((a) => a.unlocked).length}/${achievements.length} Unlocked`}
      badgeColor="#fbbf24"
      state={state}
      onRetry={onRetry}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {achievements.map((ach) => (
          <div
            key={ach.id}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: ach.unlocked ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.3)',
              border: ach.unlocked ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dashed rgba(255, 255, 255, 0.08)',
              opacity: ach.unlocked ? 1 : 0.7,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '10px',
                  backgroundColor: ach.unlocked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {ach.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: ach.unlocked ? '#f8fafc' : '#94a3b8' }}>
                  {ach.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  {ach.subtitle}
                </div>
              </div>
            </div>

            {!ach.unlocked && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  <span>Milestone Progress</span>
                  <span>{ach.progress}%</span>
                </div>
                <ProgressBar value={ach.progress} color={config.colorPalette.primary} style={{ height: '4px' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};
