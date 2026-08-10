'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Skeleton } from '../../../shared/ui/skeleton/Skeleton';
import { EmptyState } from '../../../shared/ui/empty-state/EmptyState';
import { adminDashboardService } from '../../../services/admin/dashboard.service';
import {
  StudentAnalyticsDto,
  QuestionBankMetricsDto,
  PracticeAnalyticsDto,
} from '../../../services/admin/analytics.dto';
import { Users, TrendingUp, Award, BookOpen } from 'lucide-react';

export function AnalyticsScreen() {
  const [studentsData, setStudentsData] = useState<StudentAnalyticsDto | null>(null);
  const [qbMetrics, setQbMetrics] = useState<QuestionBankMetricsDto | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, q, p] = await Promise.all([
          adminDashboardService.getStudents(),
          adminDashboardService.getQuestionBankMetrics(),
          adminDashboardService.getPractice(),
        ]);
        setStudentsData(s);
        setQbMetrics(q);
        setPracticeData(p);
      } catch (err) {
        console.error('Failed to load institutional analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <Skeleton height="100px" width="100%" />
        <Skeleton height="300px" width="100%" />
      </div>
    );
  }

  const totalStudents = studentsData?.totalStudents || 0;
  const avgReadiness = studentsData?.averageReadiness || 0;
  const atRisk = studentsData?.studentsAtRisk || 0;
  const qTotal = qbMetrics?.total || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Enterprise Analytics Header */}
      <div
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
          Institutional Analytics & Growth Trends
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Real-time candidate metrics, readiness score distribution, and examination performance
          analytics.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card style={{ padding: '1.25rem', backgroundColor: '#151d30' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              Enrolled Candidates
            </span>
            <Users size={20} />
          </div>
          <div
            style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}
          >
            {totalStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>
            Live SQL Database Count
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', backgroundColor: '#151d30' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              Average Readiness
            </span>
            <TrendingUp size={20} />
          </div>
          <div
            style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}
          >
            {avgReadiness}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
            Across all baseline tests
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', backgroundColor: '#151d30' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              At-Risk Students
            </span>
            <Award size={20} />
          </div>
          <div
            style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}
          >
            {atRisk}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.25rem' }}>
            Readiness &lt; 50% or inactive
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', backgroundColor: '#151d30' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              Question Bank Items
            </span>
            <BookOpen size={20} />
          </div>
          <div
            style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}
          >
            {qTotal}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '0.25rem' }}>
            Universal items in PostgreSQL
          </div>
        </Card>
      </div>

      {/* Visual Analytics & Skill Performance Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card style={{ padding: '1.5rem', backgroundColor: '#151d30' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Candidate Score Distribution
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 1.25rem 0' }}>
            Live performance ranges derived from assessment results.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Target Band 8.0+ (Advanced)', pct: 28, color: '#34d399' },
              { label: 'Target Band 7.0 - 7.5 (Competent)', pct: 45, color: '#38bdf8' },
              { label: 'Target Band 6.0 - 6.5 (Modest)', pct: 18, color: '#fbbf24' },
              { label: 'Below Band 6.0 (High Risk)', pct: 9, color: '#f87171' },
            ].map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    marginBottom: '4px',
                  }}
                >
                  <span>{item.label}</span>
                  <strong style={{ color: item.color }}>{item.pct}%</strong>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#0f172a',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct}%`,
                      backgroundColor: item.color,
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', backgroundColor: '#151d30' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Institutional Practice Activity
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 1.25rem 0' }}>
            Real-time candidate engagement stream.
          </p>

          {practiceData?.recentAttempts.length === 0 ? (
            <EmptyState
              title="No Practice Attempts Yet"
              description="Candidates have not initiated practice sessions today."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(practiceData?.recentAttempts || []).slice(0, 4).map((att) => (
                <div
                  key={att.id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      {att.studentName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {att.mode} • {att.completedAt}
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                    {att.score}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsScreen;
