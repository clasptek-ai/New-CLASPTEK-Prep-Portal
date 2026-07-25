import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';

export interface PerformanceZoneProps {
  config: ProgrammeConfiguration;
}

export const PerformanceZone: React.FC<PerformanceZoneProps> = ({ config }) => {
  return (
    <div
      style={{
        padding: '1.75rem',
        borderRadius: '16px',
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Performance & Prediction Trajectory
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            AI readiness score trajectory over the last 4 diagnostic mock examinations
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <TrendingUp size={14} />
          <span>+0.5 Score Growth</span>
        </div>
      </div>

      {/* Snapshot Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              Diagnostic Mock #1
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>6.5 Band</div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              Diagnostic Mock #2
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>7.0 Band</div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid config.colorPalette.primary',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: config.colorPalette.badgeBg,
              color: config.colorPalette.badgeText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div
              style={{ fontSize: '0.75rem', color: config.colorPalette.badgeText, fontWeight: 700 }}
            >
              Current Prediction
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              {config.targetMetric.current} Band
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
