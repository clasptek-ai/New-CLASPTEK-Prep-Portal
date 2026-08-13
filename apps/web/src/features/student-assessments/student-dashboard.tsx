'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { useAuthContext } from '@/providers/AuthProvider';
import { BookOpen, Clock, FileText, Play, CheckCircle2, AlertCircle } from 'lucide-react';

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

function StudentAssessmentDashboardContent() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadCurrentDiagnostic() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/student/current-assessment');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDiagnosticData(data);
          } else {
            setError(data.message || 'No active diagnostic found for your programme.');
          }
        } else {
          setError('Failed to load active diagnostic assignment.');
        }
      } catch (e: any) {
        console.error('Error loading current assessment:', e);
        setError('Network error while retrieving diagnostic configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadCurrentDiagnostic();
  }, []);

  const handleStartDiagnostic = async () => {
    if (!diagnosticData?.assessment) return;
    setStarting(true);

    try {
      if (diagnosticData.hasActiveAttempt && diagnosticData.activeAttemptId) {
        router.push(
          `/student/assessments/player?attemptId=${encodeURIComponent(diagnosticData.activeAttemptId)}`
        );
        return;
      }

      const res = await fetch('/api/v1/assessment-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: diagnosticData.assessment.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.attemptId) {
        router.push(`/student/assessments/player?attemptId=${encodeURIComponent(data.attemptId)}`);
      } else {
        setError(data.message || 'Failed to start diagnostic attempt.');
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
          padding: '2rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              textTransform: 'uppercase',
            }}
          >
            PLACEMENT DIAGNOSTICS
          </span>
          <h1
            style={{
              margin: '0.5rem 0 0.25rem',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            Programme Diagnostic Placement Assessment
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '640px' }}>
            Establish your current level, identify your strengths and weaknesses, and personalize your preparation.
          </p>
        </div>

        <Badge variant="info">
          Canonical Diagnostic Engine Active
        </Badge>
      </div>

      {/* Primary Canonical Diagnostic Card */}
      {loading ? (
        <Card
          style={{
            padding: '2.5rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          Loading diagnostic assignment for your programme...
        </Card>
      ) : error || !assessment ? (
        <Card
          style={{
            padding: '2rem',
            backgroundColor: '#1e1b4b',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: '#f87171',
          }}
        >
          <AlertCircle size={28} />
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800 }}>
              Diagnostic Assignment Notice
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              {error || 'No published diagnostic assessment is currently assigned to your active programme.'}
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <BookOpen size={20} color="#38bdf8" />
            Your Programme Diagnostic ({programme?.name || 'Active Programme'})
          </h2>

          <Card
            style={{
              padding: '2rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(59, 130, 246, 0.3)',
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
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <Badge variant="success">DIAGNOSTIC ASSESSMENT</Badge>
                <h3
                  style={{
                    margin: '0.75rem 0 0.35rem',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {assessment.title}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                  <span>Programme: <strong style={{ color: '#60a5fa' }}>{programme?.name}</strong></span>
                  <span>Duration: <strong>{assessment.durationMinutes} Minutes</strong></span>
                  <span>Questions: <strong>{assessment.totalQuestions} Items</strong></span>
                </div>
              </div>

              <Button
                variant="primary"
                disabled={starting}
                onClick={handleStartDiagnostic}
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                <Play size={18} />
                <span>
                  {starting
                    ? 'Launching...'
                    : diagnosticData?.hasActiveAttempt
                    ? 'Resume Diagnostic'
                    : 'Start Diagnostic'}
                </span>
              </Button>
            </div>

            {/* Dynamic Section Outline Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {(assessment.sections || []).map((sec, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                    {sec.name}
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: i === 0 ? '#38bdf8' : i === 1 ? '#34d399' : '#a78bfa',
                      marginTop: '0.25rem',
                    }}
                  >
                    {sec.questionCount} {sec.code === 'WRITING' ? 'Tasks' : 'Items'}
                  </div>
                </div>
              ))}
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
