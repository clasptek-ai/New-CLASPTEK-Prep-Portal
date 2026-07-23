'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../../../components/ui/ui-components';
import { BulkTable } from '../../../components/instructor/instructor-components';

export function AssessmentsScreen({ assessmentId }: { assessmentId?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(assessmentId || null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [title, setTitle] = useState('');
  const [cohort, setCohort] = useState('English Class A');
  const [date, setDate] = useState('');

  const library = [
    { id: 'a1', title: 'English Mock Exam Module A', questionCount: 40, status: 'PUBLISHED' },
    { id: 'a2', title: 'Curriculum Competency Test 1', questionCount: 20, status: 'PUBLISHED' },
    { id: 'a3', title: 'Adaptive Practice Session Final', questionCount: 30, status: 'DRAFT' },
  ];

  const [notification, setNotification] = useState<string | null>(null);

  function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setNotification(`Mock Exam "${title}" scheduled for Cohort "${cohort}" on ${date}!`);
    setTimeout(() => setNotification(null), 3000);
    setShowSchedule(false);
    setTitle('');
    setDate('');
  }

  const columns = [
    {
      header: 'Exam Title',
      render: (row: (typeof library)[0]) => (
        <span
          style={{ fontWeight: 600, cursor: 'pointer', color: '#60a5fa' }}
          onClick={() => setSelectedId(row.id)}
        >
          {row.title}
        </span>
      ),
    },
    {
      header: 'Question Count',
      render: (row: (typeof library)[0]) => <span>{row.questionCount} questions</span>,
    },
    {
      header: 'Status',
      render: (row: (typeof library)[0]) => (
        <Badge variant={row.status === 'PUBLISHED' ? 'success' : 'info'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row: (typeof library)[0]) => (
        <Button onClick={() => setSelectedId(row.id)}>Monitor Live</Button>
      ),
    },
  ];

  if (selectedId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Assessment Monitor Workspace
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Live session completions and timer status values
            </p>
          </div>
          <Button variant="secondary" onClick={() => setSelectedId(null)}>
            Back to Library
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <Card title="Live Submissions Queue">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              No live active timers in this session. All 25 students submitted. Auto AI score
              calculation outputs are ready.
            </p>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Integrity Diagnostics">
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p>Lockout Incidents: **0 flagged**</p>
                <p>IP Address Changes: **0 flags**</p>
                <Badge variant="success">All Safe</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Assessment Library</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Create schedules and inspect mock diagnostic records
          </p>
        </div>
        <Button onClick={() => setShowSchedule(true)}>Schedule Assessment</Button>
      </div>

      {notification && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '0.85rem',
          }}
        >
          {notification}
        </div>
      )}

      <BulkTable data={library} columns={columns} />

      {showSchedule && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: '#151d30',
              border: '1px solid #232e48',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0' }}>Schedule Assessment Session</h3>
            <form
              onSubmit={handleScheduleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <Input
                label="Mock Exam Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                  }}
                >
                  Select Cohort
                </label>
                <select
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #232e48',
                    backgroundColor: '#0b0f19',
                    color: '#f8fafc',
                  }}
                >
                  <option value="English Class A">English Class A</option>
                  <option value="IELTS Intensive Review">IELTS Intensive Review</option>
                </select>
              </div>
              <Input
                label="Release Date & Time"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <Button variant="ghost" onClick={() => setShowSchedule(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AssessmentsScreen;
