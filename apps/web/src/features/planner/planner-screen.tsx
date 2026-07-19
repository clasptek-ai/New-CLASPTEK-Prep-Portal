'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge } from '../../components/ui/ui-components';
import { plannerService, PlannerTask } from '../../services/planner/planner.service';

export function PlannerScreen() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [currentView, setCurrentView] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  useEffect(() => {
    async function load() {
      const list = await plannerService.getTasks();
      setTasks(list);
    }
    load();
  }, []);

  async function handleToggle(taskId: string, currentVal: boolean) {
    const success = await plannerService.toggleTask(taskId, !currentVal);
    if (success) {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: !currentVal } : t))
      );
    }
  }

  const columns = [
    {
      header: 'Status',
      render: (row: PlannerTask) => (
        <input
          type="checkbox"
          checked={row.completed}
          onChange={() => handleToggle(row.id, row.completed)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      )
    },
    {
      header: 'Task Title',
      render: (row: PlannerTask) => (
        <span style={{ textDecoration: row.completed ? 'line-through' : 'none', color: row.completed ? '#64748b' : '#f8fafc' }}>
          {row.title}
        </span>
      )
    },
    {
      header: 'Priority',
      render: (row: PlannerTask) => (
        <Badge variant={row.priority === 'HIGH' ? 'danger' : row.priority === 'MEDIUM' ? 'warning' : 'info'}>
          {row.priority}
        </Badge>
      )
    },
    {
      header: 'Duration',
      render: (row: PlannerTask) => <span>{row.duration} mins</span>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Study Planner</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Plan, manage, and complete your custom curriculum tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#151d30', padding: '0.25rem', borderRadius: '8px', border: '1px solid #232e48' }}>
          <button
            onClick={() => setCurrentView('DAILY')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentView === 'DAILY' ? '#2563eb' : 'transparent',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Daily Tasks
          </button>
          <button
            onClick={() => setCurrentView('WEEKLY')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentView === 'WEEKLY' ? '#2563eb' : 'transparent',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Weekly Schedule
          </button>
        </div>
      </div>

      {currentView === 'DAILY' ? (
        <Card title="Today's Study Checklist">
          <Table data={tasks} columns={columns} />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <Card key={idx} title={day}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {idx < 3 ? '2 Tasks scheduled' : 'Rest day'}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
