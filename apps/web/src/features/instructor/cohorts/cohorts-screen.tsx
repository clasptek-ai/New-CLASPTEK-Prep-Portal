'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { BulkTable } from '../../../components/instructor/instructor-components';
import { instructorCohortsService, CohortItem } from '../../../services/instructor/cohorts.service';

export function CohortsScreen({ cohortId }: { cohortId?: string }) {
  const [selectedCohort, setSelectedCohort] = useState<CohortItem | null>(null);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'ATTENDANCE' | 'COMPETENCY'>(
    'OVERVIEW'
  );

  useEffect(() => {
    async function load() {
      const list = await instructorCohortsService.getCohorts();
      setCohorts(list);
      if (cohortId) {
        const item = list.find((c) => c.id === cohortId) || list[0];
        setSelectedCohort(item);
      }
    }
    load();
  }, [cohortId]);

  const router = useRouter();

  const columns = [
    {
      header: 'Cohort Name',
      render: (row: CohortItem) => (
        <span
          style={{ fontWeight: 600, cursor: 'pointer', color: '#60a5fa' }}
          onClick={() => router.push(`/instructor/cohorts/${row.id}`)}
        >
          {row.name}
        </span>
      ),
    },
    {
      header: 'Students Enrolled',
      render: (row: CohortItem) => <span>{row.enrolledStudentsCount} students</span>,
    },
    {
      header: 'Average Readiness',
      render: (row: CohortItem) => <span style={{ fontWeight: 700 }}>{row.averageReadiness}%</span>,
    },
    {
      header: 'At-Risk count',
      render: (row: CohortItem) => (
        <Badge
          variant={row.atRiskCount > 5 ? 'danger' : row.atRiskCount > 1 ? 'warning' : 'success'}
        >
          {row.atRiskCount} at risk
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row: CohortItem) => (
        <Button onClick={() => router.push(`/instructor/cohorts/${row.id}`)}>Manage</Button>
      ),
    },
  ];

  if (selectedCohort) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Card title={`Cohort Workspace: ${selectedCohort.name}`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              fontSize: '0.9rem',
              color: '#cbd5e1',
            }}
          >
            <div>
              <span>Enrolled Students:</span>
              <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>
                {selectedCohort.enrolledStudentsCount}
              </strong>
            </div>
            <div>
              <span>Readiness Average:</span>
              <strong
                style={{
                  display: 'block',
                  color: '#f8fafc',
                  marginTop: '0.25rem',
                  fontSize: '1.25rem',
                }}
              >
                {selectedCohort.averageReadiness}%
              </strong>
            </div>
            <div>
              <span>Syllabus Completion:</span>
              <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>
                {selectedCohort.completionRate}%
              </strong>
            </div>
          </div>
        </Card>

        {/* Tab layout */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #232e48',
            paddingBottom: '0.5rem',
          }}
        >
          {(['OVERVIEW', 'STUDENTS', 'ATTENDANCE', 'COMPETENCY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.6rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab ? '#2563eb' : 'transparent',
                color: activeTab === tab ? '#f8fafc' : '#94a3b8',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Card title="Engagement Metrics">
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p>Average Daily Study Minutes: **42 mins / student**</p>
                <p>Mock Test Attendance Rate: **96%**</p>
              </div>
            </Card>
            <Card title="Milestone Leaderboard">
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>John Doe (Ready score: 82%)</li>
                  <li>Alice Smith (Ready score: 79%)</li>
                </ol>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'STUDENTS' && (
          <Card title="Cohort Student List">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Roster includes John Doe, Jane Smith, Bob Johnson. Navigate to the Student Directory
              for full portfolio detail reviews.
            </p>
          </Card>
        )}

        {activeTab === 'ATTENDANCE' && (
          <Card title="Attendance Summary Logs">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Diagnostic Mock Exams Attendance is at **98%** (24 out of 25 students completed
              session B).
            </p>
          </Card>
        )}

        {activeTab === 'COMPETENCY' && (
          <Card title="Competencies Heatmap Analysis">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Advanced Vocabulary shows standard high variance risk (avg 52%). Modifiers and active
              syntax are in high success limits (avg 81%).
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Cohort Management</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Monitor classroom learning aggregates, milestones progress, and rankings
        </p>
      </div>

      <BulkTable data={cohorts} columns={columns} />
    </div>
  );
}
export default CohortsScreen;
