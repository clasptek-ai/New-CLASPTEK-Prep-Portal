import React from 'react';
import { Bot, Sparkles, ArrowUpRight, Zap, AlertTriangle, Lightbulb } from 'lucide-react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { EmptyZone } from '../../../shared/ui/academic/empty-zone';

export interface AIZoneProps {
  config: ProgrammeConfiguration;
  onLaunchAssistant?: () => void;
}

export const AIZone: React.FC<AIZoneProps> = ({ config, onLaunchAssistant }) => {
  const recommendations = config.aiRecommendations;

  return (
    <div
      style={{
        padding: '1.75rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(15, 23, 42, 0.8))',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              AI Academic Coach Preview
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Tailored Diagnostic Recommendations for {config.id}
            </span>
          </div>
        </div>

        <button
          onClick={onLaunchAssistant}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            backgroundColor: '#7c3aed',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Continue Conversation</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Recommendations Cards or Empty State */}
      {recommendations.length === 0 ? (
        <EmptyZone
          title="No Active AI Recommendations"
          description="All identified weak skills are currently resolved. Complete another mock test to refresh diagnostic suggestions."
          icon={Sparkles}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: '1.1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <AlertTriangle size={12} />
                  Weak Skill Priority: {rec.priority}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  ~{rec.estMinutes} min
                </span>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {rec.title}
                </h4>
                <p
                  style={{
                    margin: '0.3rem 0 0',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    lineHeight: 1.4,
                  }}
                >
                  {rec.subtitle}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
                  Category: {rec.category}
                </span>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Zap size={13} />
                  <span>Start Drill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Study Tip Banner */}
      <div
        style={{
          padding: '0.85rem 1.1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Lightbulb size={18} color="#fbbf24" />
        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          <strong>Pro Tip:</strong> Practicing Writing Task 2 for 15 minutes right after reviewing
          sample essays improves lexical retention by 38%.
        </span>
      </div>
    </div>
  );
};
