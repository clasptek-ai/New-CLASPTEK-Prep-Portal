'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { adminAssessmentsService, AdminAssessmentConfig } from '../../services/admin/assessments.service';
import { BookOpen, Clock, FileText, CheckCircle2, Play, Sparkles } from 'lucide-react';

export function StudentAssessmentDashboard() {
  const [assessments, setAssessments] = useState<AdminAssessmentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await adminAssessmentsService.getAssessments();
        // Student view shows PUBLISHED assessments
        const published = list.filter((a) => a.status === 'PUBLISHED');
        setAssessments(published);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
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
            STUDENT ASSESSMENT CENTER
          </span>
          <h1 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Official Examination & Diagnostic Hub
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '640px' }}>
            Access assigned mock examinations, timed practice sets, and placement diagnostics synced from your programme curriculum.
          </p>
        </div>

        <Badge variant="info">Connected to Live Exam Registry</Badge>
      </div>

      {/* Available Published Assessments Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="#38bdf8" />
          Available Examinations ({assessments.length})
        </h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            Loading available examinations...
          </div>
        ) : assessments.length === 0 ? (
          <Card style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#151d30', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>No published assessments currently scheduled for your programme.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant="info">{exam.type}</Badge>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                      ✓ READY TO TAKE
                    </span>
                  </div>

                  <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.35 }}>
                    {exam.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="#60a5fa" />
                      {exam.durationMinutes} Minutes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="#34d399" />
                      {exam.questionCount} Questions
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Available: {exam.availableFrom ? new Date(exam.availableFrom).toLocaleDateString() : 'Active Term'}
                  </span>

                  <Button
                    variant="primary"
                    onClick={() => (window.location.href = `/assessments`)}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', gap: '0.4rem', display: 'flex', alignItems: 'center' }}
                  >
                    <Play size={14} />
                    <span>Start Exam</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attempt History */}
      <Card style={{ padding: '1.5rem', backgroundColor: '#151d30', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
          Recent Examination Attempt History
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>IELTS Practice Set #3</span>
              <Badge variant="success">PASSED (85%)</Badge>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Submitted 2 days ago · Duration: 28 mins</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>TOEFL iBT Reading Mock</span>
              <Badge variant="success">PASSED (78%)</Badge>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Submitted 5 days ago · Duration: 54 mins</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default StudentAssessmentDashboard;
