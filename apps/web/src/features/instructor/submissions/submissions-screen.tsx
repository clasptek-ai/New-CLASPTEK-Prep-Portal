'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { instructorSubmissionsService, Submission } from '../../../services/instructor/submissions.service';

export function SubmissionsScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState(80);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await instructorSubmissionsService.getSubmissions();
        setSubmissions(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [notification, setNotification] = useState<string | null>(null);

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubmission) return;

    const success = await instructorSubmissionsService.gradeSubmission(selectedSubmission.id, grade, feedback);
    if (success) {
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, status: 'GRADED', instructorGrade: grade, instructorFeedback: feedback } : s));
      setSelectedSubmission(null);
      setFeedback('');
      setNotification('Submission graded successfully!');
      setTimeout(() => setNotification(null), 3000);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student submissions...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedSubmission ? '1fr 400px' : '1fr', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Student Submissions</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Review, grade, and inspect automated AI essay diagnostics results</p>
        </div>

        {notification && (
          <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            {notification}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.map(sub => (
            <Card key={sub.id} title={`${sub.studentName} — ${sub.assignmentTitle}`} actions={<Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'}>{sub.status}</Badge>}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  Submitted on: <strong>{new Date(sub.submissionDate).toLocaleDateString()}</strong>
                  {sub.instructorGrade !== undefined && (
                    <div style={{ marginTop: '0.25rem', color: '#10b981' }}>Grade: {sub.instructorGrade}/100</div>
                  )}
                </div>
                <Button onClick={() => setSelectedSubmission(sub)}>
                  {sub.status === 'GRADED' ? 'Review Grade' : 'Grade Submission'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedSubmission && (
        <div>
          <Card title="Submission Grading Workspace">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>
                <span>Student:</span>
                <strong style={{ display: 'block', color: '#f8fafc' }}>{selectedSubmission.studentName}</strong>
              </div>
              {selectedSubmission.fileUrl && (
                <div>
                  <span>Submitted File:</span>
                  <a href={selectedSubmission.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#60a5fa', fontWeight: 600, marginTop: '0.25rem' }}>
                    Download Attachment PDF
                  </a>
                </div>
              )}

              {selectedSubmission.aiEvaluation && (
                <div style={{ padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px', border: '1px solid #232e48' }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.25rem' }}>AI evaluation diagnostics</div>
                  <div>Predicted IELTS Band: <strong>{selectedSubmission.aiEvaluation.predictedBand}</strong></div>
                  <div>Grammar Score: <strong>{selectedSubmission.aiEvaluation.grammarScore}%</strong></div>
                  <div>Coherence Score: <strong>{selectedSubmission.aiEvaluation.coherenceScore}%</strong></div>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.75rem' }}>"{selectedSubmission.aiEvaluation.feedback}"</div>
                </div>
              )}

              <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #232e48', paddingTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Instructor Grade (Max 100)</label>
                  <input
                    type="number"
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value))}
                    max={100}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Instructor Feedback Comments</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    required
                    placeholder="Enter academic review observations..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="submit">Approve & Return Grade</Button>
                  <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
export default SubmissionsScreen;
