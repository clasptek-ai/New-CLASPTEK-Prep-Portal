'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../../components/ui/ui-components';

export function GoalsScreen() {
  const [goals, setGoals] = useState([
    { id: '1', title: 'Study 45 minutes daily', type: 'DAILY', progress: 80 },
    { id: '2', title: 'Complete 2 Practice Sessions', type: 'WEEKLY', progress: 50 },
    { id: '3', title: 'Pass Mock Exam Module A', type: 'EXAM', progress: 0 }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('DAILY');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setGoals(prev => [
      ...prev,
      { id: Math.random().toString(), title: newTitle, type: newType, progress: 0 }
    ]);
    setNewTitle('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>My Goals</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Set and track custom targets for the exam preparation</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {goals.map((g, i) => (
            <Card key={i} title={g.title} actions={<Badge>{g.type}</Badge>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Completion Status</span>
                  <span>{g.progress}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${g.progress}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '4px' }} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Create Goal">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Goal Description" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Goal Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #232e48',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc'
                }}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="EXAM">Exam Target</option>
              </select>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
