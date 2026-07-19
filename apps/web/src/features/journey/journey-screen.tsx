'use client';

import React from 'react';
import { Card, Badge } from '../../components/ui/ui-components';

export function LearningJourneyScreen() {
  const milestones = [
    { title: 'Core Grammar Structures', progress: 100, status: 'Completed', desc: 'Active modifiers and syntax structures.' },
    { title: 'Vocabulary Expansion V1', progress: 80, status: 'In Progress', desc: 'Academic lexicon terms.' },
    { title: 'Full Length Diagnostic Exam A', progress: 0, status: 'Scheduled', desc: 'Mock assessment simulation.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Learning Journey</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Explore milestones, competencies progress, and achievements</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {milestones.map((m, i) => (
          <Card key={i} title={m.title} actions={<Badge variant={m.status === 'Completed' ? 'success' : m.status === 'In Progress' ? 'warning' : 'info'}>{m.status}</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{m.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.progress}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.progress}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
