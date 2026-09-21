'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../../../../components/ui/ui-components';
import {
  AssessmentReviewAttempt,
  StudentAttemptHistoryResponse,
  adminAssessmentReviewsService,
} from '../../../../services/admin/assessment-reviews.service';
import {
  Search,
  History,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  BookOpen,
} from 'lucide-react';

interface AttemptHistoryDirectoryProps {
  attempts: AssessmentReviewAttempt[];
  onSelectAttempt: (attemptId: string) => void;
}

export function AttemptHistoryDirectory({
  attempts,
  onSelectAttempt,
}: AttemptHistoryDirectoryProps) {
  const [viewMode, setViewMode] = useState<'all' | 'candidates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assessmentFilter, setAssessmentFilter] = useState<'ALL' | 'MOCK' | 'DIAGNOSTIC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Candidate history state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [candidateHistory, setCandidateHistory] = useState<StudentAttemptHistoryResponse | null>(
    null
  );
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filtered attempts
  const filteredAttempts = useMemo(() => {
    return attempts.filter((att) => {
      if (assessmentFilter !== 'ALL' && att.assessmentType !== assessmentFilter) return false;
      if (statusFilter !== 'ALL' && att.scoreStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = att.studentName?.toLowerCase().includes(q);
        const matchEmail = att.studentEmail?.toLowerCase().includes(q);
        const matchId = att.studentId?.toLowerCase().includes(q);
        const matchDef = att.definitionTitle?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId && !matchDef) return false;
      }
      return true;
    });
  }, [attempts, assessmentFilter, statusFilter, searchQuery]);

  // Unique candidates list
  const candidates = useMemo(() => {
    const map = new Map<
      string,
      { studentId: string; studentName: string; studentEmail: string; attemptCount: number }
    >();
    attempts.forEach((a) => {
      const existing = map.get(a.studentId);
      if (existing) {
        existing.attemptCount += 1;
      } else {
        map.set(a.studentId, {
          studentId: a.studentId,
          studentName: a.studentName || 'Candidate',
          studentEmail: a.studentEmail || 'student@clasptek.ai',
          attemptCount: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.attemptCount - a.attemptCount);
  }, [attempts]);

  const filteredCandidates = useMemo(() => {
    if (!searchQuery) return candidates;
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        c.studentName.toLowerCase().includes(q) ||
        c.studentEmail.toLowerCase().includes(q) ||
        c.studentId.toLowerCase().includes(q)
    );
  }, [candidates, searchQuery]);

  // Overall metrics
  const totalAttempts = attempts.length;
  const scoredCount = attempts.filter((a) => a.scoreStatus === 'AVAILABLE').length;
  const pendingCount = attempts.filter(
    (a) => a.scoreStatus === 'PENDING' || a.scoreStatus === 'PARTIAL'
  ).length;
  const totalCandidatesCount = candidates.length;

  // Handle student history selection
  async function handleSelectStudent(studentId: string) {
    setSelectedStudentId(studentId);
    setLoadingHistory(true);
    try {
      const hist = await adminAssessmentReviewsService.getStudentAttemptHistory(studentId);
      setCandidateHistory(hist);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Directory Header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Candidate Assessment Reviews & Attempt History
        </h1>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Audit complete examination evidence, candidate-submitted answers, multimedia recordings,
          and multi-attempt performance trajectories.
        </p>
      </div>

      {/* Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <Card
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Total Attempts
            </span>
            <History size={18} color="var(--brand-primary)" />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.5rem',
            }}
          >
            {totalAttempts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all assessment definitions
          </div>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Scored / Available
            </span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--success)',
              marginTop: '0.5rem',
            }}
          >
            {scoredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Official bands & scores ready
          </div>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Pending Evaluation
            </span>
            <AlertCircle size={18} color="var(--warning)" />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--warning)',
              marginTop: '0.5rem',
            }}
          >
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Subjective / partial reviews
          </div>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Unique Candidates
            </span>
            <User size={18} color="var(--brand-primary)" />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.5rem',
            }}
          >
            {totalCandidatesCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Enrolled test takers
          </div>
        </Card>
      </div>

      {/* View Mode Toggle & Filter Bar */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top row: Mode toggle + Search input */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {/* View Mode Switcher */}
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'all' ? 'var(--brand-primary)' : 'transparent',
                  color: viewMode === 'all' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ListFilter size={15} /> All Attempts Directory
              </button>
              <button
                type="button"
                onClick={() => setViewMode('candidates')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor:
                    viewMode === 'candidates' ? 'var(--brand-primary)' : 'transparent',
                  color: viewMode === 'candidates' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <History size={15} /> Candidate Multi-Attempt History
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '420px' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                placeholder="Search candidate name, email, ID, or assessment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Bottom row: Filter Chips (for "all" view) */}
          {viewMode === 'all' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              {/* Assessment Type Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Type:</span>
                {(['ALL', 'MOCK', 'DIAGNOSTIC'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssessmentFilter(type)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor:
                        assessmentFilter === type ? 'var(--brand-primary)' : 'var(--border)',
                      backgroundColor:
                        assessmentFilter === type ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color:
                        assessmentFilter === type ? 'var(--brand-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {type === 'ALL' ? 'All Types' : type === 'MOCK' ? 'IELTS Mock' : 'Diagnostic'}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Score Status:</span>
                {[
                  { id: 'ALL', label: 'All Statuses' },
                  { id: 'AVAILABLE', label: 'Available' },
                  { id: 'PARTIAL', label: 'Partial' },
                  { id: 'PENDING', label: 'Pending' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor:
                        statusFilter === st.id ? 'var(--brand-primary)' : 'var(--border)',
                      backgroundColor:
                        statusFilter === st.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: statusFilter === st.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredAttempts.length}</strong> of {totalAttempts} attempts
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* ─── VIEW 1: FLAT DIRECTORY TABLE ─────────────────────────────────── */}
      {viewMode === 'all' && (
        <Card
          style={{
            padding: '0',
            borderRadius: '16px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'left',
                  }}
                >
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Candidate
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Assessment
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Attempt #
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Date & Time
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Score / Result
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      No assessment attempts match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((att) => {
                    const startedDate = att.startedAt ? new Date(att.startedAt) : null;
                    const dateStr = startedDate
                      ? startedDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A';
                    const timeStr = startedDate
                      ? startedDate.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    return (
                      <tr
                        key={att.attemptId}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = 'var(--surface-1)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        {/* Candidate */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {att.studentName}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginTop: '2px',
                            }}
                          >
                            {att.studentEmail}
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--brand-primary)',
                              fontFamily: 'monospace',
                            }}
                          >
                            CGA-{att.studentId?.slice(0, 8).toUpperCase()}
                          </div>
                        </td>

                        {/* Assessment */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {att.definitionTitle}
                          </div>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              marginTop: '3px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                backgroundColor:
                                  att.assessmentType === 'MOCK'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  att.assessmentType === 'MOCK'
                                    ? 'var(--brand-primary)'
                                    : 'var(--success)',
                              }}
                            >
                              {att.assessmentType === 'MOCK' ? 'IELTS MOCK' : 'DIAGNOSTIC'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {att.sectionsCompleted}/{att.totalSections} sections
                            </span>
                          </div>
                        </td>

                        {/* Attempt # */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor:
                                att.attemptNumber > 1
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'var(--surface-1)',
                              color:
                                att.attemptNumber > 1 ? 'var(--warning)' : 'var(--text-primary)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <span>Attempt {att.attemptNumber}</span>
                            <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>
                              of {att.totalAttemptsByStudent}
                            </span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {dateStr}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {timeStr}
                          </div>
                        </td>

                        {/* Score / Result */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {att.scoreStatus === 'AVAILABLE' ? (
                            <div>
                              <span
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 800,
                                  color: 'var(--success)',
                                }}
                              >
                                {att.officialScoreLabel ||
                                  (att.assessmentType === 'MOCK'
                                    ? `Band ${att.officialScaledScore.toFixed(1)}`
                                    : `${Math.round(att.score)}%`)}
                              </span>
                              {att.cefrLevel && (
                                <span
                                  style={{
                                    marginLeft: '6px',
                                    fontSize: '0.7rem',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    backgroundColor: 'var(--surface-1)',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {att.cefrLevel}
                                </span>
                              )}
                            </div>
                          ) : att.scoreStatus === 'PARTIAL' ? (
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--warning)',
                              }}
                            >
                              Partial Scored
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Pending Evaluation
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Badge
                            variant={
                              att.status === 'SUBMITTED' || att.status === 'COMPLETED'
                                ? 'success'
                                : att.status === 'IN_PROGRESS'
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {att.status}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <Button
                            variant="primary"
                            onClick={() => onSelectAttempt(att.attemptId)}
                            style={{
                              padding: '0.4rem 0.85rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            Audit Attempt
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── VIEW 2: CANDIDATE MULTI-ATTEMPT HISTORY ─────────────────────── */}
      {viewMode === 'candidates' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selectedStudentId ? '340px 1fr' : '1fr',
            gap: '1.5rem',
          }}
        >
          {/* Candidate Selector List */}
          <Card
            style={{
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--border)',
              height: 'fit-content',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                letterSpacing: '0.04em',
              }}
            >
              Candidates ({filteredCandidates.length})
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              {filteredCandidates.map((c) => {
                const isSelected = selectedStudentId === c.studentId;
                return (
                  <div
                    key={c.studentId}
                    onClick={() => handleSelectStudent(c.studentId)}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-1)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {c.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.studentEmail}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--brand-primary)',
                          marginTop: '2px',
                          fontFamily: 'monospace',
                        }}
                      >
                        CGA-{c.studentId.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '12px',
                          backgroundColor:
                            c.attemptCount > 1 ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface-0)',
                          color: c.attemptCount > 1 ? 'var(--warning)' : 'var(--text-muted)',
                        }}
                      >
                        {c.attemptCount} {c.attemptCount === 1 ? 'attempt' : 'attempts'}
                      </span>
                      <ChevronRight
                        size={16}
                        color="var(--text-muted)"
                        style={{ marginTop: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Candidate Multi-Attempt History Panel */}
          {selectedStudentId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loadingHistory ? (
                <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading candidate multi-attempt history...
                </Card>
              ) : candidateHistory ? (
                <>
                  {/* Candidate Profile Banner */}
                  <Card
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {candidateHistory.candidate.name}
                        </h2>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            marginTop: '4px',
                          }}
                        >
                          {candidateHistory.candidate.email} | ID:{' '}
                          {candidateHistory.candidate.candidateNumber}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          Total Examination Attempts
                        </div>
                        <div
                          style={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            color: 'var(--brand-primary)',
                          }}
                        >
                          {candidateHistory.totalAttemptsAllAssessments}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Assessment Definition Groups */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {candidateHistory.assessmentGroups.map((grp) => (
                      <Card
                        key={grp.definitionId}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '16px',
                          backgroundColor: 'var(--surface-0)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <BookOpen size={17} color="var(--brand-primary)" />
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: '1.05rem',
                                  fontWeight: 800,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {grp.definitionTitle}
                              </h3>
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                backgroundColor:
                                  grp.assessmentType === 'MOCK'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  grp.assessmentType === 'MOCK'
                                    ? 'var(--brand-primary)'
                                    : 'var(--success)',
                              }}
                            >
                              {grp.assessmentType === 'MOCK' ? 'IELTS MOCK' : 'DIAGNOSTIC'}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {grp.totalAttempts}{' '}
                            {grp.totalAttempts === 1 ? 'attempt' : 'sequential attempts'}
                          </span>
                        </div>

                        {/* Chronological Attempts Grid */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '0.85rem',
                          }}
                        >
                          {grp.attempts.map((att) => {
                            const dateStr = att.startedAt
                              ? new Date(att.startedAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'N/A';

                            return (
                              <div
                                key={att.attemptId}
                                style={{
                                  padding: '1rem',
                                  borderRadius: '12px',
                                  backgroundColor: 'var(--surface-1)',
                                  border: '1px solid var(--border)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.65rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '0.8rem',
                                      fontWeight: 800,
                                      color: 'var(--brand-primary)',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                    }}
                                  >
                                    Attempt {att.attemptNumber}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {dateStr}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                  }}
                                >
                                  <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      Result
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '1.15rem',
                                        fontWeight: 800,
                                        color:
                                          att.scoreStatus === 'AVAILABLE'
                                            ? 'var(--success)'
                                            : 'var(--warning)',
                                      }}
                                    >
                                      {att.officialScoreLabel ||
                                        (att.officialScaledScore
                                          ? `Band ${att.officialScaledScore.toFixed(1)}`
                                          : 'Pending')}
                                    </div>
                                  </div>
                                  {att.cefrLevel && (
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--surface-0)',
                                        color: 'var(--text-muted)',
                                      }}
                                    >
                                      {att.cefrLevel}
                                    </span>
                                  )}
                                </div>

                                <Button
                                  variant="primary"
                                  onClick={() => onSelectAttempt(att.attemptId)}
                                  style={{
                                    width: '100%',
                                    padding: '0.45rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  Audit Attempt {att.attemptNumber}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Failed to load candidate attempt history.
                </Card>
              )}
            </div>
          ) : (
            <Card
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <History size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Select a Candidate
                </h3>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
                  Choose any candidate on the left to inspect their complete multi-attempt
                  chronological history partitioned by assessment definition.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
