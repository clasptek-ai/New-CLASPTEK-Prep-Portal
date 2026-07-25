import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import {
  FileText,
  Award,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Bookmark,
  Layers,
  PlayCircle,
} from 'lucide-react';

export interface QuickActionsWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
  onQuickAction?: (actionId: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
  onQuickAction,
}) => {
  const actions = [
    {
      id: 'diagnostic-assessment',
      title: 'Diagnostic Assessment',
      subtitle: 'Initial baseline & study plan generator',
      icon: <FileText size={20} color="#38bdf8" />,
      color: '#38bdf8',
    },
    {
      id: 'full-mock-test',
      title: 'Full Mock Test',
      subtitle: 'Timed real exam simulation',
      icon: <Award size={20} color="#a78bfa" />,
      color: '#a78bfa',
    },
    {
      id: 'reading-practice',
      title: 'Reading Practice',
      subtitle: 'Passage scanning & comprehension',
      icon: <BookOpen size={20} color="#34d399" />,
      color: '#34d399',
    },
    {
      id: 'listening-practice',
      title: 'Listening Practice',
      subtitle: 'Audio monologues & lectures',
      icon: <Headphones size={20} color="#60a5fa" />,
      color: '#60a5fa',
    },
    {
      id: 'writing-practice',
      title: 'Writing Practice',
      subtitle: 'Task 1 & Task 2 essay drills',
      icon: <Edit3 size={20} color="#f472b6" />,
      color: '#f472b6',
    },
    {
      id: 'speaking-practice',
      title: 'Speaking Practice',
      subtitle: 'Prompt recorder & fluency drill',
      icon: <Mic size={20} color="#fbbf24" />,
      color: '#fbbf24',
    },
    {
      id: 'vocabulary-builder',
      title: 'Vocabulary Builder',
      subtitle: 'Academic word list flashcards',
      icon: <Bookmark size={20} color="#c084fc" />,
      color: '#c084fc',
    },
    {
      id: 'flashcards-drill',
      title: 'Flashcards Drill',
      subtitle: 'Spaced repetition memory practice',
      icon: <Layers size={20} color="#2dd4bf" />,
      color: '#2dd4bf',
    },
    {
      id: 'resume-last-lesson',
      title: 'Resume Last Lesson',
      subtitle: 'Pick up where you left off',
      icon: <PlayCircle size={20} color={config.colorPalette.primary} />,
      color: config.colorPalette.primary,
    },
  ];

  return (
    <DashboardWidget
      title="Quick Actions & Academic Drills"
      subtitle="Instant access to targeted skill drills, diagnostic baseline tests, and full mock simulations"
      state={state}
      onRetry={onRetry}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onQuickAction?.(act.id)}
            style={{
              padding: '1.1rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = act.color;
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
            }}
          >
            <div
              style={{
                padding: '0.65rem',
                borderRadius: '10px',
                backgroundColor: `${act.color}15`,
                flexShrink: 0,
              }}
            >
              {act.icon}
            </div>
            <div>
              <div
                style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}
              >
                {act.title}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}
              >
                {act.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
};
