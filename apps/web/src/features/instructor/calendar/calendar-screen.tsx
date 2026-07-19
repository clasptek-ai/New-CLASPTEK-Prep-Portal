'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function CalendarScreen() {
  const [filterType, setFilterType] = useState<string>('ALL');

  const events = [
    { time: '10:00 AM', title: 'Advanced Grammar modifiers walkthrough', type: 'TEACHING' },
    { time: '01:00 PM', title: 'IELTS Mock Exam Module A release', type: 'ASSESSMENT' },
    { time: '03:30 PM', title: 'Feedback request office hours', type: 'OFFICE_HOURS' },
    { time: '05:00 PM', title: 'Curriculum audit sync with supervisors', type: 'MEETING' }
  ];

  const filteredEvents = filterType === 'ALL' ? events : events.filter(e => e.type === filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Teaching Calendar</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Filter mock test release times and student appointments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'TEACHING', 'ASSESSMENT', 'OFFICE_HOURS', 'MEETING'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'primary' : 'secondary'}
              onClick={() => setFilterType(type)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredEvents.map((evt, idx) => (
          <Card key={idx} title={evt.time} actions={<Badge>{evt.type}</Badge>}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{evt.title}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default CalendarScreen;
