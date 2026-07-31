'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, AlertTriangle, FileCheck, Search, Filter } from 'lucide-react';

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
  const router = useRouter();
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
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
          }}
        >
          Reports & Academic Performance Analytics
        </h1>
        <p style={{ color: '#94a3b8', margin: '0.35rem 0 0', fontSize: '0.875rem' }}>
          Monitor institutional performance metrics, readiness distributions, and student evaluation reports.
        </p>
      </div>

      {/* Interactive KPI Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Students Card */}
        <div
          onClick={() => router.push('/admin/students')}
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Total Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
              412
            </div>
            <div style={{ fontSize: '0.725rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
              Click to view Directory →
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        {/* Average Readiness Card */}
        <div
          onClick={() => setStatusFilter('ALL')}
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Average Readiness</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              78%
            </div>
            <div style={{ fontSize: '0.725rem', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>
              +4.2% from last term
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}
          >
            <TrendingUp size={22} />
          </div>
        </div>

        {/* At Risk Card */}
        <div
          onClick={() => setStatusFilter('AT_RISK')}
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>At Risk</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
              21
            </div>
            <div style={{ fontSize: '0.725rem', color: '#f87171', marginTop: '4px', fontWeight: 600 }}>
              Click to filter At Risk candidates
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
            }}
          >
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Assessments This Week Card */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
              Assessments This Week
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>
              186
            </div>
            <div style={{ fontSize: '0.725rem', color: '#a78bfa', marginTop: '4px', fontWeight: 600 }}>
              Active test submissions
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(167, 139, 250, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa',
            }}
          >
            <FileCheck size={22} />
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div
        style={{
          backgroundColor: '#111827',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            flex: 1,
            minWidth: '240px',
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f8fafc',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="#94a3b8" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.85rem',
              color: '#f8fafc',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="ALL">All Academic Statuses</option>
            <option value="EXCELLING">Excelling</option>
            <option value="ON_TRACK">On Track</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
            <option value="AT_RISK">At Risk</option>
          </select>
        </div>
      </div>

      {/* Student Results Table (Visual Dark Enterprise Theme) */}
      <div
        style={{
          backgroundColor: '#111827',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#1F2937',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <th style={{ padding: '0.85rem 1rem' }}>STUDENT</th>
              <th style={{ padding: '0.85rem 1rem' }}>OVERALL SCORE</th>
              <th style={{ padding: '0.85rem 1rem' }}>ACADEMIC STATUS</th>
              <th style={{ padding: '0.85rem 1rem' }}>TREND</th>
              <th style={{ padding: '0.85rem 1rem' }}>ASSESSMENTS</th>
              <th style={{ padding: '0.85rem 1rem' }}>AI EVALUATIONS</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No student transcripts match your filter.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr
                  key={student.studentId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    backgroundColor: '#111827',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{student.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                      ID: {student.studentId}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                    {student.overallScore}%
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          student.academicStatus === 'EXCELLING'
                            ? 'rgba(52, 211, 153, 0.15)'
                            : student.academicStatus === 'ON_TRACK'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          student.academicStatus === 'EXCELLING'
                            ? '#34d399'
                            : student.academicStatus === 'ON_TRACK'
                            ? '#60a5fa'
                            : '#f87171',
                      }}
                    >
                      {student.academicStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {student.performanceTrend}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {student.totalAssessments}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {student.totalEvaluations}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link
                      href={`/admin/students/${student.studentId}`}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        backgroundColor: '#1e293b',
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      View Transcript
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
