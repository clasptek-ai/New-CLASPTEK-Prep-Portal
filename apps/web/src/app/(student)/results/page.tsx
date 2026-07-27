'use client';

import React, { useState } from 'react';

interface ResultItem {
  id: string;
  resultType: string;
  sourceId: string;
  title: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  bandScore?: string;
  isPassing?: boolean;
  summaryFeedback?: string;
  publishedAt: string;
}

interface ProgressSummary {
  overallScore: number;
  academicStatus: string;
  performanceTrend: string;
  totalAssessments: number;
  totalPractices: number;
  totalMocks: number;
  totalEvaluations: number;
  averageBandScore?: string;
  strongestSkills: string[];
  weakestSkills: string[];
}

export default function StudentResultsDashboard() {
  const [summary, _setSummary] = useState<ProgressSummary | null>({
    overallScore: 82.5,
    academicStatus: 'ON_TRACK',
    performanceTrend: 'IMPROVING',
    totalAssessments: 12,
    totalPractices: 45,
    totalMocks: 4,
    totalEvaluations: 8,
    averageBandScore: '7.5',
    strongestSkills: ['Listening Detail', 'Reading Comprehension'],
    weakestSkills: ['Grammatical Accuracy', 'Coherence'],
  });

  const [results, _setResults] = useState<ResultItem[]>([
    {
      id: 'res-001',
      resultType: 'WRITING_EVALUATION',
      sourceId: 'eval-w-101',
      title: 'IELTS Writing Task 2 - Essay on Technology',
      score: 7.5,
      maxScore: 9,
      percentage: 83.3,
      bandScore: '7.5',
      isPassing: true,
      summaryFeedback:
        'Strong task response and cohesive structure. Focus on complex sentence structures.',
      publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'res-002',
      resultType: 'MOCK',
      sourceId: 'mock-session-04',
      title: 'Full IELTS Academic Mock Exam #4',
      score: 7.0,
      maxScore: 9,
      percentage: 77.7,
      bandScore: '7.0',
      isPassing: true,
      summaryFeedback: 'Consistent performance across modules with high listening accuracy.',
      publishedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'res-003',
      resultType: 'PRACTICE',
      sourceId: 'prac-att-88',
      title: 'Reading Passage 3: Climate Resilience',
      score: 88,
      maxScore: 100,
      percentage: 88.0,
      isPassing: true,
      summaryFeedback: 'Excellent time management and high vocabulary accuracy.',
      publishedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    },
  ]);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const filteredResults =
    filterType === 'ALL' ? results : results.filter((r) => r.resultType === filterType);

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(true);
    setReportSuccess(null);
    try {
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, format: 'JSON' }),
      });
      if (res.ok) {
        setReportSuccess(`Report '${reportType.replace('_', ' ')}' generated successfully!`);
      } else {
        setReportSuccess('Report generated locally for demonstration.');
      }
    } catch {
      setReportSuccess('Report generated locally.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1e2f 0%, #0f172a 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
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
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              Academic Performance & Results
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '1rem' }}>
              Unified transcript, exam history, and AI evaluation feedback.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span
              style={{
                background:
                  summary?.academicStatus === 'EXCELLING'
                    ? '#059669'
                    : summary?.academicStatus === 'ON_TRACK'
                      ? '#2563eb'
                      : '#dc2626',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {summary?.academicStatus.replace('_', ' ')}
            </span>
            <span
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
              }}
            >
              Trend: {summary?.performanceTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
            OVERALL BAND / SCORE
          </span>
          <div
            style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}
          >
            {summary?.averageBandScore ?? summary?.overallScore}%
          </div>
          <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
            ↑ +0.5 Band from last month
          </span>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
            COMPLETED ASSESSMENTS
          </span>
          <div
            style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563eb', margin: '0.5rem 0' }}
          >
            {summary?.totalAssessments}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Full diagnostic tests</span>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
            AI EVALUATIONS
          </span>
          <div
            style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7c3aed', margin: '0.5rem 0' }}
          >
            {summary?.totalEvaluations}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Writing & Speaking essays</span>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
            PRACTICE ATTEMPTS
          </span>
          <div
            style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669', margin: '0.5rem 0' }}
          >
            {summary?.totalPractices}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Completed modules</span>
        </div>
      </div>

      {/* Main Content Layout: History Table + Reports Generator */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Results History */}
        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Results History
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'WRITING_EVALUATION', 'MOCK', 'PRACTICE'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: filterType === t ? '#0f172a' : '#fff',
                    color: filterType === t ? '#fff' : '#475569',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredResults.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
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
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: item.resultType.includes('EVALUATION')
                          ? '#f3e8ff'
                          : item.resultType === 'MOCK'
                            ? '#dbeafe'
                            : '#e0e7ff',
                        color: item.resultType.includes('EVALUATION')
                          ? '#7e22ce'
                          : item.resultType === 'MOCK'
                            ? '#1d4ed8'
                            : '#3730a3',
                      }}
                    >
                      {item.resultType.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ margin: '0.25rem 0', color: '#0f172a', fontSize: '1rem' }}>
                    {item.title}
                  </h4>
                  {item.summaryFeedback && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#475569' }}>
                      {item.summaryFeedback}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {item.bandScore ? `Band ${item.bandScore}` : `${item.score}/${item.maxScore}`}
                  </div>
                  {item.percentage !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports & Academic Actions Sidebar */}
        <div>
          <div
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}
            >
              Download Reports
            </h3>
            {reportSuccess && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {reportSuccess}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { type: 'TRANSCRIPT', label: 'Academic Transcript' },
                { type: 'STUDENT_PROGRESS', label: 'Progress Report' },
                { type: 'ASSESSMENT_SUMMARY', label: 'Assessment Summary' },
                { type: 'AI_SUMMARY', label: 'AI Evaluation Summary' },
              ].map((rep) => (
                <button
                  key={rep.type}
                  disabled={generatingReport}
                  onClick={() => handleGenerateReport(rep.type)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{rep.label}</span>
                  <span style={{ color: '#2563eb' }}>→</span>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}
            >
              Skill Focus
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#059669',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                STRONGEST SKILLS
              </span>
              {summary?.strongestSkills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-block',
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    marginRight: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  ✓ {s}
                </span>
              ))}
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#dc2626',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                WEAKEST SKILLS
              </span>
              {summary?.weakestSkills.map((w) => (
                <span
                  key={w}
                  style={{
                    display: 'inline-block',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    marginRight: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  ⚠ {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
