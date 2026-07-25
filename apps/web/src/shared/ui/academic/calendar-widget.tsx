import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarEvent {
  day: number;
  type: 'MOCK' | 'DEADLINE' | 'PRACTICE';
  title: string;
}

export const CalendarWidget: React.FC<{ events?: CalendarEvent[] }> = ({ events = [] }) => {
  const [currentDate] = useState(new Date());
  const daysInMonth = 31;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const defaultEvents: CalendarEvent[] = [
    { day: 15, type: 'MOCK', title: 'IELTS Mock Exam #4' },
    { day: 18, type: 'DEADLINE', title: 'Writing Task 2 Submission' },
    { day: 22, type: 'PRACTICE', title: 'Listening Section 4 Sprint' },
  ];

  const activeEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: '14px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
          <CalendarIcon size={18} color="#3b82f6" />
          <span>July 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
            <ChevronLeft size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '0.25rem' }}>
        {daysOfWeek.map((d, i) => (
          <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {d}
          </span>
        ))}
      </div>

      {/* Month Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
        {Array.from({ length: daysInMonth }, (_, idx) => {
          const day = idx + 1;
          const isToday = day === currentDate.getDate();
          const hasEvent = activeEvents.find((e) => e.day === day);

          return (
            <div
              key={day}
              style={{
                position: 'relative',
                padding: '0.4rem 0',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? '#ffffff' : hasEvent ? '#38bdf8' : '#cbd5e1',
                backgroundColor: isToday
                  ? '#2563eb'
                  : hasEvent
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={hasEvent ? hasEvent.title : undefined}
            >
              {day}
              {hasEvent && !isToday && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: hasEvent.type === 'MOCK' ? '#ef4444' : '#38bdf8',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
