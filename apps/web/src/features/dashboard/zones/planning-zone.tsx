import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { CalendarWidget } from '../../../shared/ui/academic/calendar-widget';
import { Clock, Play, BarChart2 } from 'lucide-react';
import { EmptyZone } from '../../../shared/ui/academic/empty-zone';

export interface PlanningZoneProps {
  config: ProgrammeConfiguration;
  onQuickAction?: (actionId: string) => void;
}

export const PlanningZone: React.FC<PlanningZoneProps> = ({ config, onQuickAction }) => {
  const tests = config.upcomingTests;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {/* Calendar Column */}
      <div>
        <CalendarWidget />
      </div>

      {/* Upcoming Mocks & Quick Actions Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Upcoming Mock Tests */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Upcoming Diagnostics & Mocks
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {tests.length} Scheduled
            </span>
          </div>

          {tests.length === 0 ? (
            <EmptyZone
              title="No Upcoming Tests Scheduled"
              description="Schedule a diagnostic mock to test your score trajectory."
              height="120px"
            />
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                      {test.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {test.date} at {test.time}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onQuickAction?.('start-mock')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: config.colorPalette.primary,
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Start
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Action Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            onClick={() => onQuickAction?.('adaptive-practice')}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ color: '#38bdf8' }}>
              <Play size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Adaptive Practice</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Custom Skill Drills</div>
            </div>
          </button>

          <button
            onClick={() => onQuickAction?.('view-results')}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ color: '#a78bfa' }}>
              <BarChart2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Diagnostic Results</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Detailed Reports</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
