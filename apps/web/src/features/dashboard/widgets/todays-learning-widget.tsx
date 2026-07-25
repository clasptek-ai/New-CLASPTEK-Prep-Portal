import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { ProgressBar } from '../../../shared/ui/progress/ProgressBar';
import { PlayCircle, Clock, BookOpen, CheckCircle } from 'lucide-react';

export interface TodaysLearningWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
  onSelectLesson?: (lessonId: string) => void;
}

export const TodaysLearningWidget: React.FC<TodaysLearningWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
  onSelectLesson,
}) => {
  return (
    <DashboardWidget
      title="Today's Learning & Recommended Practice"
      subtitle="Curated modules based on your latest diagnostic assessment results"
      state={state}
      onRetry={onRetry}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {config.recommendedLessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'all 200ms ease',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: `${config.colorPalette.primary}20`,
                    color: config.colorPalette.badgeText,
                  }}
                >
                  {lesson.module}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Clock size={13} /> {lesson.duration} est
                </span>
              </div>

              <h4
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  lineHeight: 1.3,
                }}
              >
                {lesson.title}
              </h4>

              <div style={{ marginTop: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span>Progress</span>
                  <span style={{ fontWeight: 700 }}>{lesson.completedPercent}%</span>
                </div>
                <ProgressBar
                  value={lesson.completedPercent}
                  color={config.colorPalette.primary}
                  style={{ height: '6px' }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectLesson?.(lesson.id)}
              style={{
                width: '100%',
                justifyContent: 'center',
                gap: '0.5rem',
                borderColor: `${config.colorPalette.primary}50`,
                color: '#f8fafc',
              }}
            >
              <PlayCircle size={15} color={config.colorPalette.primary} /> Continue Lesson
            </Button>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};
