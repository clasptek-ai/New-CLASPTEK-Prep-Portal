'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  adminAssessmentsService,
  AdminAssessmentConfig,
} from '../../../services/admin/assessments.service';
import { Plus, CheckCircle2 } from 'lucide-react';

export function AssessmentsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawMode = searchParams.get('mode') || searchParams.get('type');
  const isMockView = rawMode === 'mock' || rawMode === 'MOCK';

  const [assessments, setAssessments] = useState<AdminAssessmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(isMockView ? 180 : 45);
  const [newQuestions, setNewQuestions] = useState(isMockView ? 80 : 25);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminAssessmentsService.getAssessments();
        setAssessments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handlePublish(id: string) {
    const success = await adminAssessmentsService.publishAssessment(id);
    if (success) {
      setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'PUBLISHED' } : a)));
      showBanner(
        `${isMockView ? 'Mock Examination' : 'Skill Assessment'} published live to student portals!`
      );
    }
  }

  async function handleSchedule(id: string) {
    const success = await adminAssessmentsService.scheduleAssessment(
      id,
      '2026-08-01T00:00:00Z',
      '2026-12-31T23:59:59Z'
    );
    if (success) {
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                availableFrom: '2026-08-01T00:00:00Z',
                availableUntil: '2026-12-31T23:59:59Z',
              }
            : a
        )
      );
      showBanner('Assessment availability schedule updated!');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: AdminAssessmentConfig = {
      id: `exam-${Date.now()}`,
      title: newTitle,
      type: isMockView ? 'MOCK' : 'PRACTICE',
      durationMinutes: Number(newDuration),
      questionCount: Number(newQuestions),
      availableFrom: new Date().toISOString(),
      availableUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
      status: 'PUBLISHED',
    };

    await adminAssessmentsService.createAssessment(created);
    setAssessments((prev) => [created, ...prev]);
    setCreateOpen(false);
    setNewTitle('');
    showBanner(
      `New ${isMockView ? 'Mock Examination' : 'Skill Assessment'} created and published!`
    );
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  // Filter based on view mode: MOCK view shows MOCK exams, ASSESSMENT view shows PRACTICE/DIAGNOSTIC
  const filteredList = assessments.filter((a) => {
    if (isMockView) return a.type === 'MOCK';
    return a.type === 'PRACTICE' || a.type !== 'MOCK';
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading {isMockView ? 'Mock Examinations' : 'Skill Assessments'}...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* View Switcher Tabs & Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.15rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: isMockView
                  ? 'rgba(167, 139, 250, 0.2)'
                  : 'rgba(56, 189, 248, 0.2)',
                color: isMockView ? '#a78bfa' : '#38bdf8',
                textTransform: 'uppercase',
              }}
            >
              {isMockView ? 'FULL-LENGTH SIMULATION' : 'SECTIONAL DIAGNOSTICS & QUIZZES'}
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            {isMockView
              ? 'Official Mock Examinations Center'
              : 'Diagnostic & Skill Assessments Center'}
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            {isMockView
              ? 'Configure full-length examination simulations, proctoring security rules, timed availability windows, and official score scaling.'
              : 'Configure placement diagnostics, sectional skill evaluations, module quizzes, and targeted practice sets.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mode Switcher Buttons */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#0f172a',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => router.push('/admin/assessments')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: !isMockView ? '#2563eb' : 'transparent',
                color: !isMockView ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Skill Assessments
            </button>
            <button
              onClick={() => router.push('/admin/assessments?mode=mock')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isMockView ? '#7c3aed' : 'transparent',
                color: isMockView ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Mock Exams
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateOpen(true)}
            style={{
              backgroundColor: isMockView ? '#7c3aed' : '#2563eb',
              color: '#ffffff',
              gap: '0.4rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Plus size={16} />
            <span>{isMockView ? 'Create Mock Exam' : 'Create Assessment'}</span>
          </Button>
        </div>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{banner}</span>
        </div>
      )}

      {/* Differentiation Highlights Card */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
              }}
            >
              Scope & Format
            </div>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}
            >
              {isMockView
                ? 'Full-length 3-hour official simulation'
                : 'Targeted 15–45 min skill check'}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#34d399',
                textTransform: 'uppercase',
              }}
            >
              Timer & Proctoring
            </div>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}
            >
              {isMockView
                ? 'Strict auto-submit timer & focus detection'
                : 'Flexible or untimed self-paced practice'}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#a78bfa',
                textTransform: 'uppercase',
              }}
            >
              Score Output
            </div>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}
            >
              {isMockView
                ? 'Scaled Official Band Score (e.g. Band 8.0)'
                : 'Diagnostic Objective % breakdown'}
            </div>
          </div>
        </div>
      </Card>

      {/* Assessment Table List */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
            color: '#f8fafc',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                {isMockView ? 'Mock Exam Title' : 'Assessment Title'}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Duration</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Questions</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Available Window</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No {isMockView ? 'Mock Examinations' : 'Skill Assessments'} configured yet. Click
                  "Create" to add one.
                </td>
              </tr>
            ) : (
              filteredList.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {row.title}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={row.type === 'MOCK' ? 'info' : 'neutral'}>{row.type}</Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    {row.durationMinutes} mins
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    {row.questionCount} Qs
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {row.availableFrom
                      ? `${new Date(row.availableFrom).toLocaleDateString()} - ${new Date(row.availableUntil!).toLocaleDateString()}`
                      : 'Unscheduled'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={row.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {row.status === 'DRAFT' && (
                        <Button
                          variant="primary"
                          onClick={() => handlePublish(row.id)}
                          style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                        >
                          Publish
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => handleSchedule(row.id)}>
                        Reschedule
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* CREATE MODAL */}
      {createOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setCreateOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: '0 0 1.25rem',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Create New {isMockView ? 'Mock Examination' : 'Skill Assessment'}
            </h2>

            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  {isMockView ? 'Mock Exam Title *' : 'Assessment Title *'}
                </label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    isMockView
                      ? 'e.g. IELTS Academic Full Practice Mock C'
                      : 'e.g. IELTS Relative Clauses Diagnostic'
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Question Count
                  </label>
                  <input
                    type="number"
                    value={newQuestions}
                    onChange={(e) => setNewQuestions(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  style={{ backgroundColor: isMockView ? '#7c3aed' : '#2563eb', color: '#ffffff' }}
                >
                  Save & Publish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentsScreen;
