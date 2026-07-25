import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgrammeUpcomingTest } from '../../../features/dashboard/models/programme-config';

export interface AcademicCalendarCardProps {
  upcomingTests: ProgrammeUpcomingTest[];
  accentColor?: string;
}

export const AcademicCalendarCard: React.FC<AcademicCalendarCardProps> = ({
  upcomingTests,
  accentColor = '#2563eb',
}) => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 24;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarIcon size={18} color={accentColor} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            Academic Schedule — July 2026
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            aria-label="Previous Month"
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Next Month"
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Mini Month Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
        {daysOfWeek.map((day, idx) => (
          <div key={idx} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', paddingBottom: '0.25rem' }}>
            {day}
          </div>
        ))}
        {daysInMonth.map((day) => {
          const isToday = day === currentDay;
          const hasEvent = day === 25 || day === 28;

          return (
            <div
              key={day}
              style={{
                padding: '0.4rem 0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: isToday ? 800 : 500,
                color: isToday ? '#ffffff' : '#cbd5e1',
                backgroundColor: isToday ? accentColor : hasEvent ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: hasEvent && !isToday ? `1px solid ${accentColor}` : '1px solid transparent',
                position: 'relative',
              }}
            >
              {day}
              {hasEvent && !isToday && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Test & Diagnostic Milestones List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Upcoming Milestones
        </div>

        {upcomingTests && upcomingTests.length > 0 ? (
          upcomingTests.map((test) => {
            const isDiagnostic = test.type === 'DIAGNOSTIC_ASSESSMENT';
            const badgeColor = isDiagnostic ? '#38bdf8' : '#a78bfa';
            const badgeBg = isDiagnostic ? 'rgba(56, 189, 248, 0.15)' : 'rgba(167, 139, 250, 0.15)';

            return (
              <div
                key={test.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                    }}
                  >
                    <Clock size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                      {test.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {test.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                    }}
                  >
                    {isDiagnostic ? 'DIAGNOSTIC' : 'FULL MOCK'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px', fontWeight: 600 }}>
                    {test.date} • {test.time}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
            No upcoming milestones scheduled.
          </div>
        )}
      </div>
    </div>
  );
};
