'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import {
  adminAssessmentReviewsService,
  AssessmentReviewAttempt,
  CandidateReviewDetail,
  ReviewQuestionItem,
} from '../../../services/admin/assessment-reviews.service';

export function AssessmentReviewsScreen() {
  const [attempts, setAttempts] = useState<AssessmentReviewAttempt[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<CandidateReviewDetail | null>(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminAssessmentReviewsService.getAttempts();
        setAttempts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSelectAttempt(attemptId: string) {
    setLoading(true);
    try {
      const detail = await adminAssessmentReviewsService.getAttemptDetail(attemptId);
      setSelectedDetail(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDetail || !noteText.trim()) return;
    const success = await adminAssessmentReviewsService.addAdministrativeNote(
      selectedDetail.attempt.id,
      noteText
    );
    if (success) {
      showBanner('Administrative note successfully added to attempt timeline.');
      setNoteText('');
    }
  }

  async function handleFlagAttempt() {
    if (!selectedDetail) return;
    const success = await adminAssessmentReviewsService.flagAttempt(
      selectedDetail.attempt.id,
      'Flagged for quality audit checks.'
    );
    if (success) {
      showBanner('Attempt successfully flagged for reviewer review.');
      setSelectedDetail((prev) =>
        prev
          ? {
              ...prev,
              attempt: { ...prev.attempt, status: 'FLAGGED' },
            }
          : null
      );
    }
  }

  async function handleReRunAi() {
    if (!selectedDetail) return;
    const success = await adminAssessmentReviewsService.reRunAiEvaluation(
      selectedDetail.attempt.id
    );
    if (success) {
      showBanner('AI evaluation task dispatched successfully.');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student attempts files...</h3>
      </div>
    );
  }

  if (selectedDetail) {
    const { attempt, lifecycle, questions, history, integrity } = selectedDetail;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              Attempt Review: {attempt.studentName}
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Assessment: {attempt.assessmentName} | ID: {attempt.id}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setSelectedDetail(null)}>
            Back to Attempts
          </Button>
        </div>

        {banner && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#2563eb20',
              border: '1px solid #2563eb40',
              borderRadius: '8px',
              color: '#60a5fa',
              fontSize: '0.85rem',
            }}
          >
            {banner}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Main review workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Scorecard Overview */}
            <Card
              title="Score & Metrics Overview"
              actions={
                <Badge variant={attempt.status === 'FLAGGED' ? 'danger' : 'success'}>
                  {attempt.status}
                </Badge>
              }
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#0b0f19',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Attempt Score
                  </span>
                  <strong style={{ fontSize: '1.75rem', color: '#10b981' }}>
                    {attempt.score}%
                  </strong>
                </div>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#0b0f19',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Readiness Score
                  </span>
                  <strong style={{ fontSize: '1.75rem', color: '#60a5fa' }}>
                    {attempt.readinessScore}%
                  </strong>
                </div>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#0b0f19',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Duration Spent
                  </span>
                  <strong style={{ fontSize: '1.75rem' }}>
                    {Math.floor(attempt.durationSeconds / 60)}m
                  </strong>
                </div>
              </div>
            </Card>

            {/* Questions List Review */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Question-by-Question Audits
              </h2>
              {questions.map((q) => (
                <Card
                  key={q.questionId}
                  title={`Question ID: ${q.questionId}`}
                  actions={
                    <Badge variant={q.isCorrect ? 'success' : 'danger'}>
                      {q.marksAwarded} / {q.marksAllocated} Marks
                    </Badge>
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginTop: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{q.questionText}</p>

                    {q.options && (
                      <div
                        style={{
                          paddingLeft: '1rem',
                          borderLeft: '2px solid #232e48',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          color: '#cbd5e1',
                        }}
                      >
                        {q.options.map((opt, i) => (
                          <span
                            key={i}
                            style={{
                              color:
                                opt === q.correctAnswer
                                  ? '#10b981'
                                  : opt === q.studentAnswer
                                    ? '#ef4444'
                                    : 'inherit',
                            }}
                          >
                            {opt} {opt === q.correctAnswer && '✓'}{' '}
                            {opt === q.studentAnswer && '(Selected)'}
                          </span>
                        ))}
                      </div>
                    )}

                    {!q.options && (
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#0b0f19',
                          borderRadius: '6px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Candidate Input:
                        </span>
                        <p style={{ margin: 0, color: '#f8fafc' }}>{q.studentAnswer}</p>
                      </div>
                    )}

                    {q.essayWriting && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: '#111827',
                          borderRadius: '6px',
                          borderLeft: '3px solid #60a5fa',
                        }}
                      >
                        <strong
                          style={{ display: 'block', color: '#60a5fa', marginBottom: '0.5rem' }}
                        >
                          AI Rubric Grading Coherence
                        </strong>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <div>
                            AI Band Score: <strong>{q.essayWriting.aiBandScore}</strong>
                          </div>
                          <div>
                            Coherence: <strong>{q.essayWriting.rubricCoherenceScore}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          <p style={{ margin: '0 0 0.25rem 0' }}>
                            Grammar Feedback: {q.essayWriting.grammarFeedback}
                          </p>
                          <p style={{ margin: '0 0 0.25rem 0' }}>
                            Vocabulary: {q.essayWriting.vocabularyFeedback}
                          </p>
                          <p style={{ margin: 0 }}>
                            Task: {q.essayWriting.taskAchievementFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginTop: '0.5rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <span>Type: {q.questionType}</span> |<span>Difficulty: {q.difficulty}</span> |
                      <span>Topic: {q.topic}</span> |<span>Objective: {q.learningObjective}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Attempt Lifecycle Timeline */}
            <Card title="Lifecycle Timeline">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                {lifecycle.map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      borderLeft: '2px solid #2563eb',
                      paddingLeft: '1rem',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        position: 'absolute',
                        left: '-5px',
                        top: '5px',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        display: 'block',
                      }}
                    >
                      {ev.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Assessment Integrity Metrics */}
            <Card title="Integrity Diagnostics">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  Device:{' '}
                  <strong
                    style={{
                      display: 'block',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {integrity.browserDevice}
                  </strong>
                </div>
                <div>
                  IP Address: <strong>{integrity.ipAddress}</strong>
                </div>
                <div>
                  Pauses Count: <strong>{integrity.pausesCount}</strong>
                </div>
                <div>
                  Auto-save Recoveries: <strong>{integrity.autoSaveRecoveries}</strong>
                </div>
              </div>
            </Card>

            {/* Candidate History summary Panel */}
            <Card title="Previous Attempts">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: '#0b0f19',
                      borderRadius: '4px',
                    }}
                  >
                    <span>
                      Attempt {i + 1} ({new Date(h.date).toLocaleDateString()})
                    </span>
                    <strong style={{ color: '#10b981' }}>{h.score}%</strong>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: '1px solid #1e293b',
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                  }}
                >
                  <span>Current Attempt:</span>
                  <strong style={{ color: '#60a5fa' }}>{attempt.score}%</strong>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                >
                  ▲ Improving Trend Active
                </div>
              </div>
            </Card>

            {/* Administrative commands panel */}
            <Card title="Platform Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={handleFlagAttempt}>
                  Flag Attempt for Review
                </Button>
                <Button variant="secondary" onClick={handleReRunAi}>
                  Re-run AI Evaluation
                </Button>
                <div
                  style={{
                    borderTop: '1px solid #1e293b',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <form
                    onSubmit={handleAddNote}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Internal Notes:</label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add administrative review logs..."
                      style={{
                        width: '100%',
                        height: '80px',
                        padding: '0.4rem',
                        borderRadius: '6px',
                        backgroundColor: '#0b0f19',
                        color: '#f8fafc',
                        border: '1px solid #232e48',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Button type="submit">Save Notes</Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Student Assessment Reviews
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Audit candidate mock results, review auto-save logs, and inspect AI evaluations
        </p>
      </div>

      <Table
        data={attempts}
        columns={[
          {
            header: 'Student Name',
            render: (row) => (
              <span
                style={{ fontWeight: 600, color: '#60a5fa', cursor: 'pointer' }}
                onClick={() => handleSelectAttempt(row.id)}
              >
                {row.studentName}
              </span>
            ),
          },
          { header: 'Assessment', render: (row) => <span>{row.assessmentName}</span> },
          { header: 'Type', render: (row) => <Badge>{row.assessmentType}</Badge> },
          {
            header: 'Score',
            render: (row) => <strong style={{ color: '#10b981' }}>{row.score}%</strong>,
          },
          {
            header: 'Readiness',
            render: (row) => <span style={{ color: '#60a5fa' }}>{row.readinessScore}%</span>,
          },
          {
            header: 'Evaluation',
            render: (row) => (
              <Badge variant={row.aiEvaluationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                {row.aiEvaluationStatus}
              </Badge>
            ),
          },
          {
            header: 'Actions',
            render: (row) => (
              <Button onClick={() => handleSelectAttempt(row.id)}>Audit Attempt</Button>
            ),
          },
        ]}
      />
    </div>
  );
}
export default AssessmentReviewsScreen;
