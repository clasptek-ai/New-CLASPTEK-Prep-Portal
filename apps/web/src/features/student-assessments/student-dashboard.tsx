'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import {
  adminAssessmentsService,
  AdminAssessmentConfig,
} from '../../services/admin/assessments.service';
import { BookOpen, Clock, FileText, Play, CheckCircle2 } from 'lucide-react';

function StudentAssessmentDashboardContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || '').toLowerCase();

  const [assessments, setAssessments] = useState<AdminAssessmentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const isDiagnosticMode = mode === 'diagnostic';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await adminAssessmentsService.getAssessments();
        const published = list.filter((a) => a.status === 'PUBLISHED');

        if (isDiagnosticMode) {
          // Strictly exclude Mock exams when mode=diagnostic
          const diagnostics = published.filter(
            (a) =>
              (a as any).type === 'DIAGNOSTIC' ||
              (a as any).category === 'DIAGNOSTIC' ||
              (a as any).usage === 'DIAGNOSTIC'
          );
          setAssessments(diagnostics);
        } else {
          setAssessments(published);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDiagnosticMode]);

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
      {/* Top Header Banner */}
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
            {isDiagnosticMode ? 'PLACEMENT DIAGNOSTICS' : 'STUDENT ASSESSMENT CENTER'}
          </span>
          <h1
            style={{
              margin: '0.5rem 0 0.25rem',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            {isDiagnosticMode
              ? 'English Proficiency Diagnostic Assessment'
              : 'Official Examination & Diagnostic Hub'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '640px' }}>
            {isDiagnosticMode
              ? '45-Minute Server-Authoritative Diagnostic Assessment evaluating Grammar (Foundation, Intermediate, Advanced), Reading Comprehension, and Essay & Letter Writing.'
              : 'Access assigned mock examinations, timed practice sets, and placement diagnostics synced from your programme curriculum.'}
          </p>
        </div>

        <Badge variant="info">
          {isDiagnosticMode ? 'Diagnostic Placement Engine' : 'Connected to Live Exam Registry'}
        </Badge>
      </div>

      {/* Primary Canonical Diagnostic Card when mode=diagnostic */}
      {isDiagnosticMode ? (
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
            English Proficiency Diagnostic Placement (45 Minutes)
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
                  English Proficiency Diagnostic Assessment
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                  Total Duration: <strong>45 Minutes</strong> (Server Authoritative Session)
                </p>
              </div>

              <Link
                href="/student/assessments/player?examType=English%20Proficiency"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1.75rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                <Play size={18} />
                <span>Start Diagnostic Assessment</span>
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  GRAMMAR SECTION
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                  30 Objective Questions
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  10 Foundation • 10 Intermediate • 10 Advanced
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  READING SECTION
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                  1 Passage / Group
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  Comprehension & Inference
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  WRITING SECTION
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.25rem' }}>
                  2 Writing Tasks
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  1 Letter Writing • 1 Essay Writing
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Regular Available Examinations Grid */
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
            Available Examinations ({assessments.length})
          </h2>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading available examinations...
            </div>
          ) : assessments.length === 0 ? (
            <Card
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p style={{ color: '#94a3b8', margin: 0 }}>
                No published mock assessments currently scheduled for your programme.
              </p>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {assessments.map((exam) => (
                <Card
                  key={exam.id}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#151d30',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Badge variant="info">{exam.type}</Badge>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                        ✓ READY TO TAKE
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: '0.25rem 0 0',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.35,
                      }}
                    >
                      {exam.title}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginTop: '0.25rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} />
                        {exam.durationMinutes || 60} mins
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FileText size={13} />
                        {(exam as any).totalQuestions || 40} Questions
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/student/assessments/player?examType=${encodeURIComponent(exam.examType || 'English Proficiency')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Play size={14} />
                    <span>Start Examination</span>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentAssessmentDashboard() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#94a3b8' }}>Loading Dashboard...</div>}>
      <StudentAssessmentDashboardContent />
    </Suspense>
  );
}
