'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { useAuthContext } from '@/providers/AuthProvider';
import { BookOpen, Clock, FileText, Play, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Award } from 'lucide-react';

interface DiagnosticData {
  assessment: {
    id: string;
    code: string;
    title: string;
    type: string;
    durationMinutes: number;
    totalQuestions: number;
    instructions: string;
    sections: Array<{ code: string; name: string; questionCount: number }>;
  };
  programme: {
    id: string;
    name: string;
    examType: string;
  };
  hasActiveAttempt: boolean;
  activeAttemptId: string | null;
}

interface AssessmentStateData {
  state: 'PRE_ASSESSMENT_NOT_STARTED' | 'PRE_ASSESSMENT_IN_PROGRESS' | 'PRE_ASSESSMENT_COMPLETED';
  hasCompletedPreAssessment: boolean;
  hasActiveAttempt: boolean;
  activeAttemptId: string | null;
  completedAttemptId: string | null;
  latestScore: number | null;
}

function StudentAssessmentDashboardContent() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [assessmentState, setAssessmentState] = useState<AssessmentStateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [currRes, stateRes] = await Promise.all([
          fetch('/api/v1/student/current-assessment').catch(() => null),
          fetch('/api/v1/student/assessment-state').catch(() => null),
        ]);

        if (stateRes && stateRes.ok) {
          const stateJson = await stateRes.json().catch(() => ({}));
          if (stateJson.success) {
            setAssessmentState(stateJson);
          }
        }

        if (currRes && currRes.ok) {
          const currJson = await currRes.json().catch(() => ({}));
          if (currJson.success) {
            setDiagnosticData(currJson);
          } else {
            // Non-critical fallback if current-assessment metadata lookup yields error
            console.warn('Current assessment metadata warning:', currJson.message);
          }
        }
      } catch (e: any) {
        console.error('Error loading assessment status:', e);
        setError('Network error while retrieving diagnostic configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleStartDiagnostic = async () => {
    setStarting(true);
    setError(null);

    try {
      // 1. If an active attempt exists, resume directly
      const activeId = assessmentState?.activeAttemptId || diagnosticData?.activeAttemptId;
      if (activeId) {
        router.push(`/student/assessments/player?attemptId=${encodeURIComponent(activeId)}`);
        return;
      }

      // 2. Otherwise start/create attempt
      const targetAssessmentId = diagnosticData?.assessment?.id;
      const res = await fetch('/api/v1/assessment-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetAssessmentId ? { assessmentId: targetAssessmentId } : {}),
      });

      const data = await res.json();
      const attemptId = data.data?.attemptId || data.attemptId || data.data?.id || data.id;

      if (res.ok && data.success && attemptId) {
        router.push(`/student/assessments/player?attemptId=${encodeURIComponent(attemptId)}`);
      } else {
        setError(data.message || data.error || 'Failed to start diagnostic attempt.');
        setStarting(false);
      }
    } catch (e) {
      console.error('Failed to launch attempt:', e);
      setError('Unable to initialize diagnostic session. Please try again.');
      setStarting(false);
    }
  };

  const assessment = diagnosticData?.assessment;
  const programme = diagnosticData?.programme;
  const isCompleted = assessmentState?.state === 'PRE_ASSESSMENT_COMPLETED' || assessmentState?.hasCompletedPreAssessment;
  const isInProgress = assessmentState?.state === 'PRE_ASSESSMENT_IN_PROGRESS' || assessmentState?.hasActiveAttempt || diagnosticData?.hasActiveAttempt;

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
      {/* Diagnostics Header Banner */}
      <div
        style={{
          padding: '2.25rem',
          borderRadius: '20px',
          background: isCompleted
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.98))'
            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(15, 23, 42, 0.98))',
          border: isCompleted
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              color: isCompleted ? '#34d399' : '#60a5fa',
              textTransform: 'uppercase',
            }}
          >
            {isCompleted ? 'PRE-ASSESSMENT COMPLETED' : isInProgress ? 'PRE-ASSESSMENT IN PROGRESS' : 'PRE-ASSESSMENT FOUNDATION'}
          </span>
          <h1
            style={{
              margin: '0.6rem 0 0.35rem',
              fontSize: '1.95rem',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            {isCompleted
              ? 'Your Academic Pre-Assessment Results'
              : 'Welcome to your Clasptek Assessment'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {isCompleted
              ? 'Your diagnostic baseline has been established. You now have full access to targeted practice and mock examinations.'
              : 'Before you begin your classes and mock examinations, complete your Pre-Assessment. This helps us establish your current level and personalize your learning journey.'}
          </p>
        </div>

        <div>
          {isCompleted ? (
            <Badge variant="success">Diagnostic Baseline Verified</Badge>
          ) : (
            <Badge variant="info">Diagnostic Engine Ready</Badge>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card
          style={{
            padding: '3rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
            Verifying your academic assessment status...
          </div>
        </Card>
      ) : isCompleted ? (
        /* Completed State Overview Card */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            style={{
              padding: '2.25rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                    Pre-Assessment Completed
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Placement Score: <strong style={{ color: '#34d399' }}>{assessmentState?.latestScore ? `${assessmentState.latestScore}%` : 'Graded'}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/student/results"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <FileText size={16} />
                  <span>View Diagnostic Breakdown</span>
                </Link>

                <Link
                  href="/student/mock"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <span>Go to Mock Examinations</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Not Started / In-Progress Foundation Card */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#f87171',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <Card
            style={{
              padding: '2.25rem',
              backgroundColor: '#111827',
              border: isInProgress
                ? '1px solid rgba(234, 179, 8, 0.4)'
                : '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <Badge variant={isInProgress ? 'warning' : 'primary'}>
                  {isInProgress ? 'IN PROGRESS' : 'REQUIRED FIRST STEP'}
                </Badge>
                <h3
                  style={{
                    margin: '0.75rem 0 0.35rem',
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {assessment?.title || 'Pre-Assessment Diagnostic Placement'}
                </h3>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                    display: 'flex',
                    gap: '1.5rem',
                    marginTop: '0.35rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    Programme: <strong style={{ color: '#60a5fa' }}>{programme?.name || 'English Proficiency'}</strong>
                  </span>
                  <span>
                    Duration: <strong>{assessment?.durationMinutes || 45} Minutes</strong>
                  </span>
                  <span>
                    Components: <strong>Grammar, Reading, Writing</strong>
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                disabled={starting}
                onClick={handleStartDiagnostic}
                style={{
                  padding: '0.9rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                <Play size={18} />
                <span>
                  {starting
                    ? 'Launching...'
                    : isInProgress
                    ? 'Continue Pre-Assessment'
                    : 'Start Pre-Assessment'}
                </span>
              </Button>
            </div>

            {/* Assessment Component Overview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ backgroundColor: '#1e293b', padding: '1.1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Grammar Component
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                  30 Items
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Syntax & Structure Drill
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1.1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Reading Component
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                  Passage & Items
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Comprehension & Inferences
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1.1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Writing Component
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.25rem' }}>
                  2 Tasks
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  AI Gemini Certified Grading
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export function StudentAssessmentDashboard() {
  return (
    <Suspense
      fallback={<div style={{ padding: '2rem', color: '#94a3b8' }}>Loading Diagnostics...</div>}
    >
      <StudentAssessmentDashboardContent />
    </Suspense>
  );
}
