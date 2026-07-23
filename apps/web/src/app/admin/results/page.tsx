'use client';

import React, { useState } from 'react';

interface StudentOverviewItem {
  studentId: string;
  studentName: string;
  overallScore: number;
  academicStatus: string;
  performanceTrend: string;
  totalAssessments: number;
  totalEvaluations: number;
  lastCalculatedAt: string;
}

export default function AdminResultsOverview() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [students] = useState<StudentOverviewItem[]>([
    {
      studentId: 'stu-101',
      studentName: 'Alex Morgan',
      overallScore: 88.5,
      academicStatus: 'EXCELLING',
      performanceTrend: 'IMPROVING',
      totalAssessments: 14,
      totalEvaluations: 10,
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      studentId: 'stu-102',
      studentName: 'David Chen',
      overallScore: 74.0,
      academicStatus: 'ON_TRACK',
      performanceTrend: 'STABLE',
      totalAssessments: 8,
      totalEvaluations: 6,
      lastCalculatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      studentId: 'stu-103',
      studentName: 'Sara Ahmed',
      overallScore: 58.0,
      academicStatus: 'AT_RISK',
      performanceTrend: 'DECLINING',
      totalAssessments: 5,
      totalEvaluations: 3,
      lastCalculatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentId.includes(search);
    const matchesStatus = statusFilter === 'ALL' || s.academicStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>
          Admin Operations — Academic Results Portal
        </h1>
        <p style={{ color: '#64748b', margin: '0.5rem 0 0' }}>
          Monitor institutional performance, academic status distributions, and individual student
          transcripts.
        </p>
      </div>

      {/* Control Bar */}
      <div
        style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Search by student name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: '#fff',
          }}
        >
          <option value="ALL">All Academic Statuses</option>
          <option value="EXCELLING">Excelling</option>
          <option value="ON_TRACK">On Track</option>
          <option value="NEEDS_ATTENTION">Needs Attention</option>
          <option value="AT_RISK">At Risk</option>
        </select>
      </div>

      {/* Student List Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '0.85rem',
              }}
            >
              <th style={{ padding: '1rem' }}>STUDENT</th>
              <th style={{ padding: '1rem' }}>OVERALL SCORE</th>
              <th style={{ padding: '1rem' }}>ACADEMIC STATUS</th>
              <th style={{ padding: '1rem' }}>TREND</th>
              <th style={{ padding: '1rem' }}>ASSESSMENTS</th>
              <th style={{ padding: '1rem' }}>AI EVALUATIONS</th>
              <th style={{ padding: '1rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{student.studentName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    ID: {student.studentId}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                  {student.overallScore}%
                </td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background:
                        student.academicStatus === 'EXCELLING'
                          ? '#dcfce7'
                          : student.academicStatus === 'ON_TRACK'
                            ? '#dbeafe'
                            : '#fee2e2',
                      color:
                        student.academicStatus === 'EXCELLING'
                          ? '#15803d'
                          : student.academicStatus === 'ON_TRACK'
                            ? '#1d4ed8'
                            : '#b91c1c',
                    }}
                  >
                    {student.academicStatus.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                  {student.performanceTrend}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{student.totalAssessments}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{student.totalEvaluations}</td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => alert(`Viewing transcript for ${student.studentName}`)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    View Transcript
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
