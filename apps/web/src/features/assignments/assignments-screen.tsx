'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import {
  studentAssignmentsService,
  StudentAssignment,
} from '../../services/student/assignments.service';

export function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [fileInputUrl, setFileInputUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentAssignmentsService.getAssignments();
        setAssignments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      const url =
        fileInputUrl ||
        'https://supabase.co/storage/v1/object/public/submissions/manual_upload.pdf';
      const success = await studentAssignmentsService.submitAssignment(
        selectedAssignment.id,
        url,
        textContent
      );
      if (success) {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === selectedAssignment.id
              ? { ...a, status: 'SUBMITTED', fileUrl: url, submittedAt: new Date().toISOString() }
              : a
          )
        );
        setSelectedAssignment(null);
        setFileInputUrl('');
        setTextContent('');
        showBanner('Assignment submitted successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student homework assignments list...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: selectedAssignment ? '1fr 400px' : '1fr',
        gap: '2rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>My Class Assignments</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Read task descriptions, instructions guides, and inspect AI evaluations logs
          </p>
        </div>

        {banner && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#10b98120',
              border: '1px solid #10b98140',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '0.85rem',
            }}
          >
            {banner}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignments.map((ass) => (
            <Card
              key={ass.id}
              title={ass.title}
              actions={
                <Badge
                  variant={
                    ass.status === 'GRADED'
                      ? 'success'
                      : ass.status === 'SUBMITTED'
                        ? 'info'
                        : 'warning'
                  }
                >
                  {ass.status}
                </Badge>
              }
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <p style={{ margin: 0 }}>{ass.description}</p>
                <div style={{ color: '#64748b' }}>
                  Due Date: {ass.dueDate} | Max Score: {ass.maxScore}
                </div>
                {ass.grade !== undefined && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#0b0f19',
                      borderRadius: '6px',
                      borderLeft: '3px solid #10b981',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#10b981', display: 'block' }}>
                      Score: {ass.grade} / {ass.maxScore}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginTop: '0.25rem',
                      }}
                    >
                      Instructor Feedback: {ass.instructorFeedback}
                    </span>
                  </div>
                )}
                {ass.aiEvaluation && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#0b0f19',
                      borderRadius: '6px',
                      borderLeft: '3px solid #60a5fa',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#60a5fa', display: 'block' }}>
                      AI Diagnostics Breakdown:
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        margin: '0.25rem 0',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                      }}
                    >
                      <span>
                        Grammar: <strong>{ass.aiEvaluation.grammarScore}</strong>
                      </span>
                      <span>
                        Coherence: <strong>{ass.aiEvaluation.coherenceScore}</strong>
                      </span>
                      <span>
                        Lexical: <strong>{ass.aiEvaluation.lexicalScore}</strong>
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>
                      AI Advice: {ass.aiEvaluation.overallFeedback}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {ass.status !== 'GRADED' && (
                    <Button onClick={() => setSelectedAssignment(ass)}>
                      {ass.status === 'SUBMITTED' ? 'Replace Submission' : 'Submit Task'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedAssignment && (
        <Card title={`Submit Assignment: ${selectedAssignment.title}`}>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              {selectedAssignment.instructions}
            </p>
            {selectedAssignment.submissionType === 'FILE' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem',
                  }}
                >
                  Submission Document Link
                </label>
                <input
                  type="text"
                  placeholder="https://supabase.co/storage/v1/object/public/submissions/doc.pdf"
                  value={fileInputUrl}
                  onChange={(e) => setFileInputUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#0b0f19',
                    color: '#f8fafc',
                    border: '1px solid #232e48',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
            {selectedAssignment.submissionType === 'TEXT' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem',
                  }}
                >
                  Online Text Editor
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type your assignments review answers here..."
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#0b0f19',
                    color: '#f8fafc',
                    border: '1px solid #232e48',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="submit">Submit Task</Button>
              <Button variant="secondary" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
export default AssignmentsScreen;
