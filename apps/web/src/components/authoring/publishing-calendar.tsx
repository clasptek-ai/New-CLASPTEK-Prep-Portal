'use client';

import React from 'react';
import { Card } from '../ui/ui-components';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  category: 'PROGRAMME' | 'ASSESSMENT' | 'COURSE';
}

export function PublishingCalendar({ events }: { events: CalendarEventItem[] }) {
  return (
    <Card title="Publication Schedule Calendar">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '0.75rem',
          backgroundColor: '#020617',
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontWeight: 600,
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #1e293b',
            }}
          >
            {day}
          </div>
        ))}
        {/* Simple calendar rendering stubs */}
        {Array.from({ length: 28 }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayString = `2026-07-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
          const dayEvents = events.filter((e) => e.date === dayString);

          return (
            <div
              key={idx}
              style={{
                minHeight: '60px',
                padding: '0.25rem',
                border: '1px solid #1e293b',
                borderRadius: '4px',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                {dayNum}
              </span>
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.25rem',
                    borderRadius: '2px',
                    backgroundColor: '#10b981',
                    color: '#f8fafc',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={evt.title}
                >
                  {evt.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
export default PublishingCalendar;
