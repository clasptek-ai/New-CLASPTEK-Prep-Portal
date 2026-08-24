'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { mockGeneratorService } from '../mock-engine/application/mock-generator.service';
import { MockTemplate, MockSession, MockResult } from '../mock-engine/domain/mock-blueprint';
import { IELTSExamEngine } from '../mock-engine/components/IELTSExamEngine';
import { Award, Clock, Play } from 'lucide-react';

export interface MockDashboardProps {
  availableTemplates?: { id: string; title: string; durationMinutes: number }[];
  onStart?: (templateId: string) => void;
}

export function MockDashboard({ onStart }: MockDashboardProps) {
  const [templates, setTemplates] = useState<MockTemplate[]>([]);
  const [activeSession, setActiveSession] = useState<MockSession | null>(null);
  const [activeResult, setActiveResult] = useState<MockResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Player View State
  const [, setCurrentSectionIndex] = useState(0);
  const [, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerMap, setSelectedAnswerMap] = useState<Record<string, string>>({});
  const [viewState, setViewState] = useState<'DASHBOARD' | 'PLAYER' | 'RESULT'>('DASHBOARD');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const tmpls = await mockGeneratorService.getTemplates();
        setTemplates(tmpls);
      } catch (e) {
        console.error('Failed to load mock templates', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Restore active session and answers on page load
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('clasptek_active_mock_session');
      const savedAnswers = localStorage.getItem('clasptek_active_mock_answers');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.id) {
          setActiveSession(parsed);
          if (savedAnswers) setSelectedAnswerMap(JSON.parse(savedAnswers));
          setViewState('PLAYER');
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Autosave active session and answers on changes
  useEffect(() => {
    if (activeSession && viewState === 'PLAYER') {
      try {
        localStorage.setItem('clasptek_active_mock_session', JSON.stringify(activeSession));
        localStorage.setItem('clasptek_active_mock_answers', JSON.stringify(selectedAnswerMap));
      } catch {
        /* ignore */
      }
    } else if (viewState === 'RESULT') {
      try {
        localStorage.removeItem('clasptek_active_mock_session');
        localStorage.removeItem('clasptek_active_mock_answers');
      } catch {
        /* ignore */
      }
    }
  }, [activeSession, selectedAnswerMap, viewState]);

  async function handleLaunchMock(templateId: string) {
    if (onStart) onStart(templateId);
    setLoading(true);
    const tmpl = templates.find((t) => t.id === templateId || t.blueprintId === templateId);
    const session = await mockGeneratorService.startSession(templateId, undefined, tmpl?.exam);
    setActiveSession(session);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswerMap({});
    setViewState('PLAYER');
    setLoading(false);
  }

  async function handleSubmitMock() {
    if (!activeSession) return;
    setLoading(true);

    const formattedAnswers: Record<
      string,
      { questionId: string; studentAnswer: string; timeSpentSeconds: number }
    > = {};
    Object.entries(selectedAnswerMap).forEach(([qId, ans]) => {
      formattedAnswers[qId] = { questionId: qId, studentAnswer: ans, timeSpentSeconds: 45 };
    });

    const res = await mockGeneratorService.submitSession(activeSession.id, formattedAnswers);
    setActiveResult(res);
    setViewState('RESULT');
    setLoading(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem',
        backgroundColor: '#0b0f19',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* VIEW 1: STUDENT MOCK DASHBOARD */}
      {viewState === 'DASHBOARD' && (
        <>
          {/* Header */}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <Award size={24} />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Official Mock Examinations Engine
                </h1>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Full-length timed exam simulations for IELTS, TOEFL, SAT, CELPIP & English
                Proficiency.
              </p>
            </div>

            <Badge variant="success">Proctoring & Integrity System Active</Badge>
          </div>

          {/* Readiness Band Score Prediction Widget */}
          <Card
            style={{
              padding: '1.5rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
            }}
          >
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
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Official Score Readiness Prediction
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#38bdf8',
                    marginTop: '0.25rem',
                  }}
                >
                  IELTS Band 7.5 / TOEFL 105 / SAT 1420
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.35rem 0 0' }}>
                  Based on your performance across official blueprint sections.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => handleLaunchMock(templates[0]?.id || 'tmpl-ielts-acad')}
              >
                Take Official Mock Test Now
              </Button>
            </div>
          </Card>

          {/* Available Mock Examination Templates Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Available Official Exam Mocks ({templates.length})
            </h2>

            {loading ? (
              <div style={{ color: '#94a3b8', padding: '2rem' }}>
                Loading Exam Blueprints & Mocks...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {templates.map((t) => (
                  <Card
                    key={t.id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <Badge variant="primary">{t.exam}</Badge>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Clock size={14} /> {t.totalDurationMinutes} mins
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          margin: '0 0 0.5rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {t.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                        {t.totalQuestions} Questions | {t.sections.length} Blueprint Sections |
                        Official Scoring Conversion
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => handleLaunchMock(t.id)}
                      style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Play size={16} /> Start Full Mock Examination
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: IELTS SECTION-AWARE EXAM ENGINE */}
      {viewState === 'PLAYER' && activeSession && (
        <IELTSExamEngine
          session={activeSession as any}
          selectedAnswerMap={selectedAnswerMap}
          onAnswerChange={(questionId, answer) =>
            setSelectedAnswerMap((prev) => ({ ...prev, [questionId]: answer }))
          }
          onSubmit={handleSubmitMock}
        />
      )}

      {/* VIEW 3: OFFICIAL MOCK RESULT & BAND CONVERSION */}
      {viewState === 'RESULT' && activeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <Card
            style={{
              padding: '2.5rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <Award size={56} color="#3b82f6" />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Official Mock Examination Score Report
            </h2>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#34d399' }}>
              {activeResult.scoreResult.bandOrScale}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
              Official Classification: <strong>{activeResult.scoreResult.label}</strong> (
              {activeResult.scoreResult.percentage}% Raw Accuracy)
            </div>

            <Button variant="primary" onClick={() => setViewState('DASHBOARD')}>
              Return to Mock Dashboard
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MockDashboard;
