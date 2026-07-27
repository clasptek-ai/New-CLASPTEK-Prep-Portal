import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { CircularProgress } from '../../../shared/ui/progress/CircularProgress';
import { ProgressBar } from '../../../shared/ui/progress/ProgressBar';
import { RadarSkillChart } from '../../../shared/ui/academic/radar-skill-chart';

export interface LearningProgressWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
}

export const LearningProgressWidget: React.FC<LearningProgressWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
}) => {
  const overallCompletion = 68;

  return (
    <DashboardWidget
      title="Learning & Skills Mastery"
      subtitle={`Adaptive skill trajectory for ${config.title}`}
      badge={config.badge}
      badgeColor={config.colorPalette.primary}
      state={state}
      onRetry={onRetry}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left: Overall Completion Circular Progress */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
          }}
        >
          <CircularProgress value={overallCompletion} size={130} strokeWidth={10} />
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              {overallCompletion}% Curriculum Completed
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Weekly Target: +5.2% score improvement
            </div>
          </div>
        </div>

        {/* Center: Skill Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Skill Performance Distribution
          </div>
          {config.skills.map((skill) => {
            const percent = Math.round((skill.score / skill.maxScore) * 100);
            const statusColor =
              skill.status === 'EXCELLENT'
                ? '#34d399'
                : skill.status === 'STABLE'
                  ? '#38bdf8'
                  : '#f59e0b';

            return (
              <div
                key={skill.id}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>{skill.name}</span>
                  <span style={{ fontWeight: 700, color: statusColor }}>
                    {skill.score} / {skill.maxScore} ({skill.trend})
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  color={config.colorPalette.primary}
                  style={{ height: '8px' }}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Radar Skill Distribution Chart */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem',
          }}
        >
          <RadarSkillChart
            skills={config.skills}
            accentColor={config.colorPalette.primary}
            size={220}
          />
        </div>
      </div>
    </DashboardWidget>
  );
};
