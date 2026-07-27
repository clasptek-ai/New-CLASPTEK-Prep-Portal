import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { Sparkles, MessageSquare, ArrowRight, Lightbulb } from 'lucide-react';

export interface AICoachWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
  onLaunchAssistant?: () => void;
}

export const AICoachWidget: React.FC<AICoachWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
  onLaunchAssistant,
}) => {
  const topRec = config.aiRecommendations[0];

  return (
    <DashboardWidget
      title="AI Academic Coach"
      subtitle="Intelligent performance insights & real-time study guidance"
      badge="AI Active"
      badgeColor="#a78bfa"
      state={state}
      onRetry={onRetry}
      actionSlot={
        onLaunchAssistant && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLaunchAssistant}
            style={{
              gap: '0.4rem',
              borderColor: 'rgba(167, 139, 250, 0.4)',
              color: '#a78bfa',
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
            }}
          >
            <MessageSquare size={14} /> Continue Conversation
          </Button>
        )
      }
    >
      {topRec ? (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(15, 23, 42, 0.6))',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#a78bfa',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#a78bfa',
                    textTransform: 'uppercase',
                  }}
                >
                  Today's Top Recommendation ({topRec.category})
                </span>
                <h4
                  style={{
                    margin: '0.15rem 0 0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                  }}
                >
                  {topRec.title}
                </h4>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor:
                  topRec.priority === 'HIGH'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                color: topRec.priority === 'HIGH' ? '#f87171' : '#fbbf24',
              }}
            >
              {topRec.priority} PRIORITY
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {topRec.subtitle}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}
            >
              <Lightbulb size={14} color="#fbbf24" />
              <span>Est. completion: {topRec.estMinutes} minutes</span>
            </div>

            {onLaunchAssistant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLaunchAssistant}
                style={{ color: '#a78bfa', gap: '0.4rem', padding: '0 0.5rem' }}
              >
                Start Practice Drill <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          No recommendations currently available for this programme.
        </div>
      )}
    </DashboardWidget>
  );
};
