'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui/ui-components';

export function JournalScreen() {
  const [journals, setJournals] = useState([
    { date: '2026-07-15', mood: '😀 Happy', content: 'Completed practice mock, score is improving.', coachAdvice: 'Keep reinforcing vocabulary!' },
    { date: '2026-07-12', mood: '😐 Neutral', content: 'Grammar exercises are still slightly confusing.', coachAdvice: 'Try spacing reviews out.' }
  ]);
  const [text, setText] = useState('');
  const [mood, setMood] = useState('😀 Happy');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setJournals(prev => [
      {
        date: new Date().toISOString().split('T')[0],
        mood,
        content: text,
        coachAdvice: 'Great reflection! Continue focusing on targeted study slots.'
      },
      ...prev
    ]);
    setText('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Reflection Journal</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Log your mood, learning difficulties, and get AI feedback</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {journals.map((j, i) => (
            <Card key={i} title={`${j.date} — Mood: ${j.mood}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <p style={{ margin: 0, color: '#f8fafc' }}>{j.content}</p>
                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', borderLeft: '3px solid #14b8a6', color: '#cbd5e1', fontSize: '0.8rem' }}>
                  <strong>Coach feedback:</strong> {j.coachAdvice}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Add Reflection">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Mood Check-in</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #232e48',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc'
                }}
              >
                <option value="😀 Happy">😀 Happy</option>
                <option value="😐 Neutral">😐 Neutral</option>
                <option value="😟 Stressed">😟 Stressed</option>
                <option value="📚 Focused">📚 Focused</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Notes / Thoughts</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                placeholder="How did study go today? What challenges did you face?"
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #232e48',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <Button type="submit">Submit Journal</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
