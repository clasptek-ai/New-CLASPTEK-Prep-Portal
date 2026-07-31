'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/ui-components';
import { adminUsersService, AdminUserRecord } from '@/services/admin/users.service';
import {
  ArrowLeft,
  User,
  BookOpen,
  Award,
  Layers,
  BarChart2,
  CreditCard,
  History,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  UserX,
  UserCheck,
} from 'lucide-react';

type ProfileTab =
  | 'overview'
  | 'programme'
  | 'assessments'
  | 'practice'
  | 'diagnostics'
  | 'payments'
  | 'activity'
  | 'certificates';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<AdminUserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [banner, setBanner] = useState<string | null>(null);

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

  const handleTogglePractice = async () => {
    if (!student) return;
    await adminUsersService.togglePracticeGate(student.id);
    setStudent({ ...student, practiceUnlocked: !student.practiceUnlocked });
    showBanner(`Practice gate status updated to ${!student.practiceUnlocked ? 'Unlocked' : 'Locked'}.`);
  };

  const handleToggleMock = async () => {
    if (!student) return;
    await adminUsersService.toggleMockGate(student.id);
    setStudent({ ...student, mockUnlocked: !student.mockUnlocked });
    showBanner(`Mock Exam gate status updated to ${!student.mockUnlocked ? 'Unlocked' : 'Locked'}.`);
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

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading Candidate Master Profile Record...</h3>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <h2>Candidate Record Not Found</h2>
        <p style={{ margin: '0.5rem 0 1.5rem' }}>No student candidate matches ID: {studentId}</p>
        <Link href="/admin/students">
          <Button variant="secondary">Return to Student Directory</Button>
        </Link>
      </div>
    );
  }

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'programme', label: 'Programme', icon: <BookOpen size={16} /> },
    { id: 'assessments', label: 'Assessments', icon: <Award size={16} /> },
    { id: 'practice', label: 'Practice', icon: <Layers size={16} /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <BarChart2 size={16} /> },
    { id: 'activity', label: 'Activity Log', icon: <History size={16} /> },
    { id: 'certificates', label: 'Certificates', icon: <ShieldCheck size={16} /> },
  ];

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
      {/* Top Back Navigation & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          href="/admin/students"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Back to Student Directory
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={handleResetPassword} style={{ gap: '0.4rem', fontSize: '0.8rem' }}>
            <KeyRound size={14} color="#60a5fa" />
            Reset Password
          </Button>
          <Button
            variant="secondary"
            onClick={handleToggleStatus}
            style={{
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: student.status === 'ACTIVE' ? '#f87171' : '#34d399',
              borderColor: student.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)',
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
            color: '#34d399',
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

      {/* Profile Master Header Banner */}
      <Card
        style={{
          padding: '1.75rem',
          borderRadius: '16px',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                backgroundColor: '#1e293b',
                border: '2px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontSize: '1.75rem',
                fontWeight: 800,
              }}
            >
              {student.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>
                  {student.name}
                </h1>
                <Badge variant={student.status === 'ACTIVE' ? 'success' : 'danger'}>{student.status}</Badge>

              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  Reg ID: {student.registrationNumber}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={14} color="#64748b" /> {student.email}
                </span>
                {student.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Phone size={14} color="#64748b" /> {student.phone}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} color="#64748b" /> Enrolled: {new Date(student.registeredDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Access Gates Status Badges & Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={handleTogglePractice}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                backgroundColor: student.practiceUnlocked ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                color: student.practiceUnlocked ? '#34d399' : '#94a3b8',
                borderColor: student.practiceUnlocked ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)',
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
                backgroundColor: student.mockUnlocked ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                color: student.mockUnlocked ? '#a78bfa' : '#94a3b8',
                borderColor: student.mockUnlocked ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                gap: '0.4rem',
              }}
            >
              {student.mockUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
              Mock Gate: {student.mockUnlocked ? 'Unlocked' : 'Locked'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 8 Profile Sub-Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                backgroundColor: isActive ? '#1F2937' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
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

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card title="Candidate Operational Summary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Enrolled Programme:</span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>{student.programme}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Active Cohort:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>{student.cohort || '2026 Q3 Cohort A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Overall Prep Progress:</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>{student.progressPercent || 75}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Target Band / Score:</span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>8.0 Band (IELTS Academic)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Last Active Session:</span>
                  <span style={{ fontWeight: 600, color: '#94a3b8' }}>{student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Today'}</span>
                </div>
              </div>
            </Card>

            <Card title="Account & Audit History">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                {student.statusHistory && student.statusHistory.length > 0 ? (
                  student.statusHistory.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f8fafc' }}>
                        <span>Status: {item.status}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: '#94a3b8', marginTop: '4px' }}>Reason: {item.reason}</div>
                      <div style={{ color: '#64748b', fontSize: '0.725rem', marginTop: '2px' }}>By: {item.changedBy}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>
                    Initial operational account setup completed.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'programme' && (
          <Card title="Enrolled Prep Programme & Curriculum Progress">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1rem', fontWeight: 700 }}>{student.programme}</h4>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Comprehensive preparation curriculum including diagnostic baselines, module practice items, and simulated mock exams.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>14 / 16</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Modules Completed</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>88.5%</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Average Diagnostic Score</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>8.0</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Predicted Band Score</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'assessments' && (
          <Card title="Diagnostic & Mock Assessment Results">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#f8fafc', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1F2937', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Assessment Title</th>
                  <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Type</th>
                  <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Score / Band</th>
                  <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Date Completed</th>
                  <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>Full-Length Mock Exam #1</td>
                  <td style={{ padding: '0.75rem' }}><Badge variant="info">Mock Exam</Badge></td>
                  <td style={{ padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>8.0 Band</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>2026-07-20</td>
                  <td style={{ padding: '0.75rem' }}><Badge variant="success">PASSED</Badge></td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>Initial Diagnostic Assessment</td>
                  <td style={{ padding: '0.75rem' }}><Badge variant="info">Diagnostic</Badge></td>
                  <td style={{ padding: '0.75rem', color: '#34d399', fontWeight: 700 }}>7.5 Band</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>2026-07-05</td>
                  <td style={{ padding: '0.75rem' }}><Badge variant="success">COMPLETED</Badge></td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'practice' && (
          <Card title="Practice Session History & Question Stats">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Questions Attempted</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>418</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Accuracy Rate</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>84.2%</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Time Spent</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>18h 45m</div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'diagnostics' && (
          <Card title="Skill Proficiency & Weakness Diagnostics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { skill: 'Reading Comprehension & Inference', score: 88 },
                { skill: 'Listening Academic Lectures', score: 82 },
                { skill: 'Writing Task 2 Essay Structure', score: 76 },
                { skill: 'Speaking Fluency & Coherence', score: 80 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.skill}</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{item.score}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}



        {activeTab === 'activity' && (
          <Card title="Candidate Activity Audit Log">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {[
                { event: 'Mock Exam Attempt Submitted', time: '2 hours ago', detail: 'Completed IELTS Full Mock #1 with 8.0 Band' },
                { event: 'Practice Session Started', time: '1 day ago', detail: 'Reading Academic Passage 3' },
                { event: 'Account Access Gate Unlocked', time: '3 days ago', detail: 'Administrator unlocked Mock Exam Gate' },
              ].map((act, i) => (
                <div key={i} style={{ padding: '0.85rem', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f8fafc' }}>
                    <span>{act.event}</span>
                    <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem' }}>{act.time}</span>
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: '3px' }}>{act.detail}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'certificates' && (
          <Card title="Issued Completion Credentials & Badges">
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '12px' }}>
              <ShieldCheck size={48} color="#34d399" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Preparation Readiness Badge Issued</h3>
              <p style={{ margin: '0.35rem 0 1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Candidate has satisfied diagnostic baselines and mock requirements for {student.programme}.
              </p>
              <Button variant="secondary" style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}>
                Download Verified Readiness Certificate (PDF)
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
