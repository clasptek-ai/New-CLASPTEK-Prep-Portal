'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Input } from '../../../components/ui/ui-components';
import { BulkTable, RiskBadge, Timeline } from '../../../components/instructor/instructor-components';
import { instructorStudentsService, StudentProfile } from '../../../services/instructor/students.service';
import { instructorFeedbackService, InstructorNoteItem } from '../../../services/instructor/feedback.service';
import { instructorReadinessService, StudentReadinessDetails } from '../../../services/instructor/readiness.service';

export function StudentsScreen({ studentId }: { studentId?: string }) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JOURNEY' | 'PRACTICE' | 'ASSIGNMENTS' | 'MOCKS' | 'READINESS' | 'INSTRUCTOR_NOTES'>('OVERVIEW');
  const [notesText, setNotesText] = useState('');
  const [noteCategory, setNoteCategory] = useState<InstructorNoteItem['category']>('ACADEMIC');
  const [noteVisibility, setNoteVisibility] = useState<InstructorNoteItem['visibility']>('PUBLIC');
  const [notesList, setNotesList] = useState<InstructorNoteItem[]>([]);
  const [readiness, setReadiness] = useState<StudentReadinessDetails | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (studentId) {
          // Enforce scoping check: Instructor A cannot query student profiles outside their directory list
          const list = await instructorStudentsService.getStudents();
          const exists = list.some(s => s.id === studentId);
          if (!exists) {
            setPermissionError(true);
            setLoading(false);
            return;
          }

          const profile = await instructorStudentsService.getStudent(studentId);
          setSelectedStudent(profile);

          const notes = await instructorFeedbackService.getNotes(studentId);
          setNotesList(notes);

          const rd = await instructorReadinessService.getStudentReadiness(studentId);
          setReadiness(rd);
        } else {
          const list = await instructorStudentsService.getStudents();
          setStudents(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!notesText.trim() || !selectedStudent) return;

    try {
      const newNote = await instructorFeedbackService.addNote({
        studentId: selectedStudent.id,
        category: noteCategory,
        visibility: noteVisibility,
        content: notesText
      });

      setNotesList(prev => [newNote, ...prev]);
      setNotesText('');
      showBanner('Instructor note saved to permanent student record!');
    } catch (err) {
      console.error(err);
    }
  }

  function showBanner(msg: string) {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student workspace metrics...</h3>
      </div>
    );
  }

  if (permissionError) {
    return (
      <Card style={{ borderLeft: '4px solid #ef4444' }}>
        <h3 style={{ margin: 0, color: '#ef4444' }}>Access Denied</h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
          Strict Scoping Rules: You are not authorized to view students outside your assigned programmes.
        </p>
        <Button style={{ marginTop: '1rem' }} onClick={() => router.push('/instructor/students')}>Return to Directory</Button>
      </Card>
    );
  }

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      header: 'Student Name',
      render: (row: StudentProfile) => (
        <span style={{ fontWeight: 600, cursor: 'pointer', color: '#60a5fa' }} onClick={() => router.push(`/instructor/students/${row.id}`)}>
          {row.name}
        </span>
      )
    },
    {
      header: 'Email',
      render: (row: StudentProfile) => <span>{row.email}</span>
    },
    {
      header: 'Readiness Score',
      render: (row: StudentProfile) => <span style={{ fontWeight: 700 }}>{row.readinessScore}%</span>
    },
    {
      header: 'Risk Level',
      render: (row: StudentProfile) => <RiskBadge status={row.riskStatus} />
    },
    {
      header: 'Progress',
      render: (row: StudentProfile) => <span>{row.milestoneCompletion}% completed</span>
    },
    {
      header: 'Actions',
      render: (row: StudentProfile) => (
        <Button onClick={() => router.push(`/instructor/students/${row.id}`)}>
          Open Student Workspace
        </Button>
      )
    }
  ];

  if (selectedStudent) {
    const studentEvents = [
      { date: '2026-07-16', title: 'Submitted Exam Diagnostic Test A', desc: 'Auto-evaluation completed with band prediction of 7.0', category: 'Exam' },
      { date: '2026-07-12', title: 'Flagged as At-Risk by Prediction Engine', desc: 'Readiness score dipped below target parameters due to inactive study gaps', category: 'Alert' },
      { date: '2026-07-10', title: 'Activated Vocabulary Practice exercises', desc: 'Completed 15 vocabulary blocks', category: 'Practice' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {bannerMessage && (
          <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            {bannerMessage}
          </div>
        )}

        {/* Profile Header */}
        <Card title={`Student Workspace: ${selectedStudent.name}`} actions={<RiskBadge status={selectedStudent.riskStatus} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div>
              <span>Email:</span>
              <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{selectedStudent.email}</strong>
            </div>
            <div>
              <span>Current Readiness:</span>
              <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem', fontSize: '1.25rem' }}>{selectedStudent.readinessScore}%</strong>
            </div>
            <div>
              <span>Milestones Progress:</span>
              <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{selectedStudent.milestoneCompletion}%</strong>
            </div>
          </div>
        </Card>

        {/* Tab Workspace switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #232e48', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          {(['OVERVIEW', 'JOURNEY', 'PRACTICE', 'ASSIGNMENTS', 'MOCKS', 'READINESS', 'INSTRUCTOR_NOTES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.6rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab ? '#14b8a6' : 'transparent',
                color: activeTab === tab ? '#f8fafc' : '#94a3b8',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tab content renders */}
        {activeTab === 'OVERVIEW' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card title="Weak Competencies & Focus Area">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedStudent.weakCompetencies.map((c, i) => (
                  <Badge key={i} variant="danger">{c}</Badge>
                ))}
              </div>
            </Card>
            <Card title="AI Advisor Note">
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                &ldquo;Grammar active modifiers accuracy has improved by 12% following practice sessions. Recommend setting up essay assignments.&rdquo;
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'JOURNEY' && (
          <Card title="Timeline Activity Tracker">
            <Timeline events={studentEvents} />
          </Card>
        )}

        {activeTab === 'PRACTICE' && (
          <Card title="Practice Analytics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>Practice Accuracy: <strong>72.5%</strong></div>
              <div>Time spent: <strong>4.2 hours</strong></div>
              <div>Streak: <strong>5 days active</strong></div>
            </div>
          </Card>
        )}

        {activeTab === 'ASSIGNMENTS' && (
          <Card title="Assignments & Exercises Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>Advanced Essay Syntax: <Badge variant="success">GRADED (85/100)</Badge></div>
              <div>IELTS Vocabulary exercises: <Badge variant="warning">PENDING SUBMISSION</Badge></div>
            </div>
          </Card>
        )}

        {activeTab === 'MOCKS' && (
          <Card title="Diagnostic Mocks History">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px' }}>
                <div>Mock Name: <strong>Diagnostic Test A</strong></div>
                <div>Score: <strong>82%</strong> | Date: 2026-07-16</div>
                <div>Incorrect Questions: <strong>#12, #24, #31</strong></div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'READINESS' && readiness && (
          <Card title="Prediction Readiness Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>Overall Readiness Score: <strong>{readiness.overallReadiness}%</strong></div>
              <div>Confidence Level: <strong>{readiness.confidence}%</strong></div>
              <div>Risk Tier: <Badge variant={readiness.riskLevel === 'HIGH' ? 'danger' : 'success'}>{readiness.riskLevel}</Badge></div>
              <div>Priority Study Plan: <em>{readiness.recommendedStudyPlan}</em></div>
              <div>Suggested mock exam date: <strong>{readiness.suggestedMockDate}</strong></div>
            </div>
          </Card>
        )}

        {activeTab === 'INSTRUCTOR_NOTES' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
            <Card title="Log Permanent Note">
              <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Note Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
                  >
                    <option value="ACADEMIC">Academic Progress</option>
                    <option value="ASSIGNMENT">Assignment Review</option>
                    <option value="MOCK">Mock Review</option>
                    <option value="GENERAL">General Log</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Visibility</label>
                  <select
                    value={noteVisibility}
                    onChange={(e) => setNoteVisibility(e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
                  >
                    <option value="PUBLIC">Visible to Student & Admin</option>
                    <option value="ADMIN_ONLY">Visible to Admins Only</option>
                  </select>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  required
                  placeholder="Leave diagnostic feedback or notes logs..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #232e48',
                    backgroundColor: '#0b0f19',
                    color: '#f8fafc',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <Button type="submit">Save Notes</Button>
              </form>
            </Card>

            <Card title="Notes History Logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notesList.map((n) => (
                  <div key={n.id} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f19', borderLeft: '3px solid #14b8a6', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.7rem', color: '#64748b' }}>
                      <span>Category: {n.category}</span>
                      <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>{n.content}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b', textAlign: 'right' }}>
                      {n.visibility === 'PUBLIC' ? 'Shared with student' : 'Admin only'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Student Directory</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Search, select, and manage student learning plans</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <BulkTable
        data={filtered}
        columns={columns}
        onBulkAction={(items) => showBanner(`Bulk Messaging triggered for ${items.length} students`)}
        bulkActionLabel="Broadcast Message to Selected"
      />
    </div>
  );
}
export default StudentsScreen;
