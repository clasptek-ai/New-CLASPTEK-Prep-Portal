'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/ui-components';
import { PageContainer, PageContent } from '@/shared/ui/layout/PageContainer';
import { adminUsersService, AdminUserRecord } from '@/services/admin/users.service';
import { AttemptInspectorModal } from '@/features/admin/attempt-review/attempt-review-console';
import {
  ArrowLeft,
  User,
  BookOpen,
  Award,
  Layers,
  BarChart2,
  History,
  ShieldCheck,
  Mail,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  KeyRound,
  UserX,
  UserCheck,
  Eye,
} from 'lucide-react';

type ProfileTab =
  | 'overview'
  | 'programme'
  | 'assessments'
  | 'practice'
  | 'diagnostics'
  | 'activity'
  | 'certificates';

interface AssessmentAttemptHistoryItem {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  examType: string;
  status: string;
  score: number;
  cefr: string;
  predictedBand: string;
  placement: string;
  recommendedCourse: string;
  recommendedDuration: string;
  submittedAt: string;
  startedAt: string;
  duration: number;
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<AdminUserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('diagnostics');
  const [banner, setBanner] = useState<string | null>(null);

  // Assessment History state
  const [historyAttempts, setHistoryAttempts] = useState<AssessmentAttemptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [examTypeFilter, setExamTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!studentId) return;
      setLoading(true);
      try {
        const record = await adminUsersService.getUserById(studentId);
        setStudent(record);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  // Load assessment history
  useEffect(() => {
    if (!studentId) return;
    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const targetId = student?.id || studentId;
        const res = await fetch(
          `/api/v1/admin/students/${encodeURIComponent(targetId)}/assessment-history`
        );
        const json = await res.json();
        if (json.data?.attempts) {
          setHistoryAttempts(json.data.attempts);
        }
      } catch (err) {
        console.error('Failed to fetch student assessment history:', err);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, [studentId, student?.email, student?.id]);

  const handleTogglePractice = async () => {
    if (!student) return;
    await adminUsersService.togglePracticeGate(student.id);
    setStudent({ ...student, practiceUnlocked: !student.practiceUnlocked });
    showBanner(
      `Practice gate status updated to ${!student.practiceUnlocked ? 'Unlocked' : 'Locked'}.`
    );
  };

  const handleToggleMock = async () => {
    if (!student) return;
    await adminUsersService.toggleMockGate(student.id);
    setStudent({ ...student, mockUnlocked: !student.mockUnlocked });
    showBanner(
      `Mock Exam gate status updated to ${!student.mockUnlocked ? 'Unlocked' : 'Locked'}.`
    );
  };

  const handleToggleStatus = async () => {
    if (!student) return;
    const nextStatus = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminUsersService.updateUserStatus(student.id, nextStatus, 'Admin profile update');
    setStudent({ ...student, status: nextStatus });
    showBanner(`Candidate status updated to ${nextStatus}.`);
  };

  const handleResetPassword = async () => {
    if (!student) return;
    await adminUsersService.initiatePasswordReset(student.id);
    showBanner(`Password reset dispatch initiated for ${student.name}.`);
  };

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  const filteredAttempts = historyAttempts.filter((att) => {
    if (categoryFilter !== 'ALL' && att.category?.toUpperCase() !== categoryFilter.toUpperCase())
      return false;
    if (examTypeFilter !== 'ALL') {
      const examLower = (att.examType || '').toLowerCase();
      const filterLower = examTypeFilter.toLowerCase();
      if (!examLower.includes(filterLower) && !filterLower.includes(examLower)) return false;
    }
    if (statusFilter !== 'ALL' && att.status?.toUpperCase() !== statusFilter.toUpperCase())
      return false;
    return true;
  });

  if (loading) {
    return (
      <PageContainer>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Loading Candidate Master Profile Record...
          </h3>
        </div>
      </PageContainer>
    );
  }

  if (!student) {
    return (
      <PageContainer>
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h2>Candidate Record Not Found</h2>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>No student candidate matches ID: {studentId}</p>
          <Link href="/admin/students">
            <Button variant="secondary">Return to Student Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'diagnostics', label: 'Diagnostics & Assessment History', icon: <BarChart2 size={16} /> },
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'programme', label: 'Programme', icon: <BookOpen size={16} /> },
    { id: 'assessments', label: 'Assessments', icon: <Award size={16} /> },
    { id: 'practice', label: 'Practice', icon: <Layers size={16} /> },
    { id: 'activity', label: 'Activity Log', icon: <History size={16} /> },
    { id: 'certificates', label: 'Certificates', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <PageContainer>
      <PageContent>
        {/* Top Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <Link
            href="/admin/students"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Back to Student Directory
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              onClick={handleResetPassword}
              style={{ gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <KeyRound size={14} color="var(--brand-primary)" />
              Reset Password
            </Button>
            <Button
              variant="secondary"
              onClick={handleToggleStatus}
              style={{
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: student.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)',
                borderColor:
                  student.status === 'ACTIVE'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(52, 211, 153, 0.3)',
              }}
            >
              {student.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
              {student.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
            </Button>
          </div>
        </div>

        {banner && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '8px',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{banner}</span>
          </div>
        )}

        {/* Header Banner */}
        <Card
          style={{
            padding: '1.75rem',
            borderRadius: '16px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--surface-1)',
                  border: '2px solid var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                }}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {student.name}
                  </h1>
                  <Badge variant={student.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {student.status}
                  </Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    marginTop: '0.6rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                    Reg ID: {student.registrationNumber}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={14} color="var(--text-muted)" /> {student.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} color="var(--text-muted)" /> Enrolled:{' '}
                    {new Date(student.registeredDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                onClick={handleTogglePractice}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  backgroundColor: student.practiceUnlocked
                    ? 'rgba(52, 211, 153, 0.12)'
                    : 'var(--surface-1)',
                  color: student.practiceUnlocked ? 'var(--success)' : 'var(--text-muted)',
                  borderColor: student.practiceUnlocked
                    ? 'rgba(52, 211, 153, 0.3)'
                    : 'var(--border)',
                  gap: '0.4rem',
                }}
              >
                {student.practiceUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                Practice Gate: {student.practiceUnlocked ? 'Unlocked' : 'Locked'}
              </Button>

              <Button
                variant="secondary"
                onClick={handleToggleMock}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  backgroundColor: student.mockUnlocked
                    ? 'rgba(167, 139, 250, 0.12)'
                    : 'var(--surface-1)',
                  color: student.mockUnlocked ? 'var(--accent-purple)' : 'var(--text-muted)',
                  borderColor: student.mockUnlocked ? 'rgba(167, 139, 250, 0.3)' : 'var(--border)',
                  gap: '0.4rem',
                }}
              >
                {student.mockUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                Mock Gate: {student.mockUnlocked ? 'Unlocked' : 'Locked'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Sub-Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.25rem',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--surface-2)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: isActive
                    ? '2px solid var(--brand-primary)'
                    : '2px solid transparent',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div>
          {/* DIAGNOSTICS & ASSESSMENT HISTORY TAB (PRIMARY AUDIT INTERFACE) */}
          {activeTab === 'diagnostics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Filter Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: 'var(--surface-0)',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Assessment History Audit ({filteredAttempts.length} Records)
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="DIAGNOSTIC">Diagnostic</option>
                    <option value="PRACTICE">Practice</option>
                    <option value="MOCK">Mock Exam</option>
                  </select>

                  <select
                    value={examTypeFilter}
                    onChange={(e) => setExamTypeFilter(e.target.value)}
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Exam Types</option>
                    <option value="English Proficiency">English Proficiency</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="SAT">SAT</option>
                    <option value="CELPIP">CELPIP</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              {/* Assessment Cards List */}
              {historyLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading candidate assessment history...
                </div>
              ) : filteredAttempts.length === 0 ? (
                <Card
                  style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  No completed assessment attempts recorded matching filter criteria.
                </Card>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {filteredAttempts.map((att) => (
                    <Card
                      key={att.attemptId}
                      style={{
                        padding: '1.5rem',
                        backgroundColor: 'var(--surface-0)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1.25rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'var(--brand-subtle)',
                              color: 'var(--brand-primary)',
                            }}
                          >
                            {att.category} • {att.examType}
                          </span>
                          <Badge variant={att.status === 'SUBMITTED' ? 'success' : 'info'}>
                            {att.status}
                          </Badge>
                        </div>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {att.assessmentTitle}
                        </h3>

                        {/* Score Metrics Badges */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem',
                            backgroundColor: 'var(--surface-1)',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                fontWeight: 700,
                              }}
                            >
                              OVERALL SCORE
                            </div>
                            <div
                              style={{
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                color: 'var(--brand-primary)',
                              }}
                            >
                              {att.score}%
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                fontWeight: 700,
                              }}
                            >
                              CEFR LEVEL
                            </div>
                            <div
                              style={{
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                color: 'var(--accent-purple)',
                              }}
                            >
                              {att.cefr}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                fontWeight: 700,
                              }}
                            >
                              PREDICTED BAND
                            </div>
                            <div
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                color: 'var(--success)',
                                marginTop: '2px',
                              }}
                            >
                              {att.predictedBand}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            Submitted:{' '}
                            <strong>{new Date(att.submittedAt).toLocaleDateString()}</strong>
                          </span>
                          <span>
                            Duration: <strong>{att.duration} Mins</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAttemptId(att.attemptId)}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          backgroundColor: 'var(--brand-primary)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <Eye size={15} />
                        <span>View Attempt →</span>
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <Card title="Candidate Operational Summary">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Enrolled Programme:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {student.programme}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Active Cohort:</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                      {student.cohort || 'UNASSIGNED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Overall Prep Progress:</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {student.progressPercent ?? 0}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="Account Audit History">
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  Initial operational account setup completed.
                </div>
              </Card>
            </div>
          )}

          {/* PROGRAMME TAB */}
          {activeTab === 'programme' && (
            <Card title="Enrolled Prep Programme & Curriculum Progress">
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-1)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    color: 'var(--brand-primary)',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  {student.programme}
                </h4>
                <p
                  style={{
                    margin: '0.35rem 0 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Comprehensive preparation curriculum including diagnostic baselines and timed mock
                  exams.
                </p>
              </div>
            </Card>
          )}

          {/* ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (
            <Card title="Diagnostic & Mock Assessment Summary">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Select the <strong>Diagnostics & Assessment History</strong> tab above to inspect
                frozen paper snapshots and candidate responses.
              </p>
            </Card>
          )}

          {/* PRACTICE TAB */}
          {activeTab === 'practice' && (
            <Card title="Practice Session History & Question Stats">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--surface-1)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Questions Attempted
                  </div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    418
                  </div>
                </div>
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--surface-1)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Accuracy Rate
                  </div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--success)',
                      marginTop: '4px',
                    }}
                  >
                    84.2%
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <Card title="Candidate Activity Audit Log">
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-1)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Account access and assessment audit logs active.
              </div>
            </Card>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <Card title="Issued Completion Credentials & Badges">
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--surface-1)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <ShieldCheck
                  size={48}
                  color="var(--success)"
                  style={{ margin: '0 auto 0.75rem' }}
                />
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                  Preparation Readiness Badge Issued
                </h3>
              </div>
            </Card>
          )}
        </div>

        {/* Attempt Inspector Modal */}
        {selectedAttemptId && (
          <AttemptInspectorModal
            attemptId={selectedAttemptId}
            studentId={student?.id || studentId}
            onClose={() => setSelectedAttemptId(null)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
}
