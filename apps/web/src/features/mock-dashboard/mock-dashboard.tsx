'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { mockGeneratorService } from '../mock-engine/application/mock-generator.service';
import { MockTemplate, MockSession, MockResult } from '../mock-engine/domain/mock-blueprint';
import { IELTSExamEngine } from '../mock-engine/components/IELTSExamEngine';
import { Award, Clock, Play } from 'lucide-react';
import {
  CANONICAL_CONTENT_VERSION,
  checkAndInvalidateClientCaches,
  isStaleListeningSession,
} from '../../lib/content-version';

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

  const [assessmentState, setAssessmentState] = useState<{
    state: 'PRE_ASSESSMENT_NOT_STARTED' | 'PRE_ASSESSMENT_IN_PROGRESS' | 'PRE_ASSESSMENT_COMPLETED';
    hasCompletedPreAssessment: boolean;
  } | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      checkAndInvalidateClientCaches();
      setLoading(true);
      try {
        const [tmpls, stateRes] = await Promise.all([
          mockGeneratorService.getTemplates().catch(() => []),
          fetch('/api/v1/student/assessment-state', { cache: 'no-store' }).catch(() => null),
        ]);
        setTemplates(tmpls);
        if (stateRes && stateRes.ok) {
          const stateJson = await stateRes.json().catch(() => ({}));
          if (stateJson.success) setAssessmentState(stateJson);
        }
      } catch (e) {
        console.error('Failed to load mock dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const answersRef = useRef<Record<string, string>>({});

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    answersRef.current[questionId] = answer;
    setSelectedAnswerMap((prev) => ({ ...prev, [questionId]: answer }));
    try {
      localStorage.setItem('clasptek_active_mock_answers', JSON.stringify(answersRef.current));
    } catch {
      /* ignore */
    }
  }, []);

  // Restore active session and answers on page load with canonical server-backed validation
  useEffect(() => {
    async function restoreSession() {
      try {
        checkAndInvalidateClientCaches();
        const savedSession = localStorage.getItem('clasptek_active_mock_session');
        const savedAnswers = localStorage.getItem('clasptek_active_mock_answers');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          const isLocallyExpired =
            parsed?.expiresAt && Date.now() >= new Date(parsed.expiresAt).getTime();
          const isCompletedLocally =
            parsed?.status === 'SUBMITTED' || parsed?.status === 'COMPLETED';

          if (
            !parsed?.id ||
            isStaleListeningSession(parsed) ||
            isLocallyExpired ||
            isCompletedLocally
          ) {
            localStorage.removeItem('clasptek_active_mock_session');
            localStorage.removeItem('clasptek_active_mock_answers');
            setActiveSession(null);
            setViewState('DASHBOARD');
            return;
          }

          // Authoritative server check against /api/v1/mock/session/[id]
          try {
            const serverCheckRes = await fetch(`/api/v1/mock/session/${parsed.id}`, {
              cache: 'no-store',
            });
            if (serverCheckRes.ok) {
              const serverSession = await serverCheckRes.json();
              if (
                serverSession.isExpired ||
                serverSession.status === 'SUBMITTED' ||
                serverSession.status === 'COMPLETED' ||
                serverSession.timeRemainingSeconds <= 0
              ) {
                // Completed or expired on server — do not allow reopening
                localStorage.removeItem('clasptek_active_mock_session');
                localStorage.removeItem('clasptek_active_mock_answers');
                setActiveSession(null);
                setViewState('DASHBOARD');
                return;
              }

              // Update session with authoritative server timing
              parsed.startedAt = serverSession.startedAt || parsed.startedAt;
              parsed.expiresAt = serverSession.expiresAt || parsed.expiresAt;
              parsed.timeRemainingSeconds = serverSession.timeRemainingSeconds;
              parsed.status = serverSession.status;
            }
          } catch {
            /* If network fails during check, local authoritative deadline is preserved */
          }

          let loadedAnswers: Record<string, string> = {};
          if (savedAnswers) {
            try {
              loadedAnswers = JSON.parse(savedAnswers);
            } catch {
              /* ignore */
            }
          }
          answersRef.current = loadedAnswers;
          setSelectedAnswerMap(loadedAnswers);
          setActiveSession(parsed);
          setViewState('PLAYER');
          return;
        }
      } catch {
        localStorage.removeItem('clasptek_active_mock_session');
        localStorage.removeItem('clasptek_active_mock_answers');
      }
    }
    void restoreSession();
  }, []);

  // Autosave active session and answers on changes with version stamp
  useEffect(() => {
    if (activeSession && viewState === 'PLAYER') {
      try {
        const sessionWithVersion = {
          ...activeSession,
          contentVersion: CANONICAL_CONTENT_VERSION,
        };
        localStorage.setItem('clasptek_active_mock_session', JSON.stringify(sessionWithVersion));
        localStorage.setItem('clasptek_active_mock_answers', JSON.stringify(answersRef.current));
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
    setLaunchError(null);
    if (onStart) onStart(templateId);
    setLoading(true);
    try {
      const tmpl = templates.find((t) => t.id === templateId || t.blueprintId === templateId);
      const resolvedBlueprintId = tmpl?.blueprintId || templateId;
      const session = await mockGeneratorService.startSession(
        resolvedBlueprintId,
        undefined,
        tmpl?.exam
      );
      (session as any).contentVersion = CANONICAL_CONTENT_VERSION;
      answersRef.current = {};
      setSelectedAnswerMap({});
      setActiveSession(session);
      setCurrentSectionIndex(0);
      setCurrentQuestionIndex(0);
      setViewState('PLAYER');
    } catch (err: any) {
      console.error('Failed to launch mock:', err);
      setLaunchError(err.message || 'Unable to launch mock examination.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitMock() {
    if (!activeSession) return;
    setLoading(true);

    // Merge immediate answersRef with component state and localStorage to prevent any race condition
    let combinedAnswers = { ...answersRef.current, ...selectedAnswerMap };
    try {
      const stored = localStorage.getItem('clasptek_active_mock_answers');
      if (stored) {
        const parsed = JSON.parse(stored);
        combinedAnswers = { ...parsed, ...combinedAnswers };
      }
    } catch {
      /* ignore */
    }

    const formattedAnswers: Record<
      string,
      { questionId: string; studentAnswer: string; timeSpentSeconds: number }
    > = {};
    Object.entries(combinedAnswers).forEach(([qId, ans]) => {
      if (ans && ans.trim().length > 0) {
        formattedAnswers[qId] = { questionId: qId, studentAnswer: ans, timeSpentSeconds: 45 };
      }
    });

    try {
      const res = await mockGeneratorService.submitSession(activeSession.id, formattedAnswers);
      setActiveResult(res);
      setViewState('RESULT');
    } catch (err: any) {
      console.error('Failed to submit mock session:', err);
    } finally {
      setLoading(false);
    }
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
                    backgroundColor: '#EAF4FC',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#045EAD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={22} />
                </div>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Official Mock Examinations
                </h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Full-length timed exam simulations for IELTS, TOEFL, SAT, CELPIP & English Proficiency.
              </p>
            </div>

            <Badge variant="success">Proctoring & Integrity Active</Badge>
          </div>

          {/* Launch Error Notice */}
          {launchError && (
            <div
              style={{
                padding: '0.875rem 1.25rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--error-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span>{launchError}</span>
            </div>
          )}

          {/* Pre-Assessment Gating Guidance Banner */}
          {assessmentState &&
            assessmentState.state !== 'PRE_ASSESSMENT_COMPLETED' &&
            !assessmentState.hasCompletedPreAssessment && (
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: '#EAF4FC',
                  border: '1px solid #B9DDF8',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: '#FFFFFF',
                      color: '#045EAD',
                      textTransform: 'uppercase',
                    }}
                  >
                    RECOMMENDED FOUNDATION
                  </span>
                  <h3
                    style={{
                      margin: '0.5rem 0 0.25rem',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#050310',
                    }}
                  >
                    Pre-Assessment Recommended for Baseline Profile
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                    Completing your diagnostic Pre-Assessment establishes your starting academic profile. You can also proceed directly to official full-length mock simulations below.
                  </p>
                </div>

                <a
                  href="/student/assessments"
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: '#045EAD',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>Start Pre-Assessment →</span>
                </a>
              </div>
            )}

          {/* Readiness Band Score Prediction Widget */}
          <Card
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
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
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Official Score Readiness Prediction
                </div>
                <div
                  style={{
                    fontSize: '1.875rem',
                    fontWeight: 800,
                    color: '#045EAD',
                    marginTop: '0.25rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  IELTS Band 7.5 / TOEFL 105 / SAT 1420
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
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
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Available Official Exam Mocks ({templates.length})
            </h2>

            {loading ? (
              <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
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
                      backgroundColor: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
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
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Clock size={13} /> {t.totalDurationMinutes} mins
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '0 0 0.5rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {t.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {t.totalQuestions} Questions · {t.sections.length} Blueprint Sections · Official Scoring Conversion
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => handleLaunchMock(t.id)}
                      style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Play size={15} /> Start Full Mock Examination
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
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmitMock}
        />
      )}

      {/* VIEW 3: OFFICIAL MOCK RESULT & BAND CONVERSION */}
      {viewState === 'RESULT' && activeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <Card
            style={{
              padding: '2.5rem',
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#EAF4FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#045EAD',
              }}
            >
              <Award size={40} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Official Mock Examination Score Report
            </h2>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--success)' }}>
              {activeResult.scoreResult.bandOrScale}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Official Classification: <strong style={{ color: 'var(--text-primary)' }}>{activeResult.scoreResult.label}</strong> (
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
