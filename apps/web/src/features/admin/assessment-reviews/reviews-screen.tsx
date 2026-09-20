'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '../../../shared/ui/layout/PageContainer';
import {
  adminAssessmentReviewsService,
  AssessmentReviewAttempt,
  CandidateReviewDetail,
} from '../../../services/admin/assessment-reviews.service';
import { FileText, ArrowLeft } from 'lucide-react';

export function AssessmentReviewsScreen() {
  const [attempts, setAttempts] = useState<AssessmentReviewAttempt[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<CandidateReviewDetail | null>(null);
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

  function _showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <PageContainer>
        <PageContent>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Loading student examination attempts...</h3>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  /* DETAILED EXAMINATION AUDIT VIEW */
  if (selectedDetail) {
    const { attempt, questions } = selectedDetail;
    const totalQuestions = questions.length;
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const wrongCount = questions.filter((q) => !q.isCorrect && q.studentAnswer).length;
    const unansweredCount = questions.filter((q) => !q.studentAnswer).length;
    const percentage = attempt.score ?? Math.round((correctCount / totalQuestions) * 100);
    const isPassed = percentage >= 70;

    const timeStartedStr = attempt.startedAt
      ? new Date(attempt.startedAt).toLocaleTimeString()
      : '10:00 AM';
    const timeSubmittedStr = attempt.submittedAt
      ? new Date(attempt.submittedAt).toLocaleTimeString()
      : '10:45 AM';
    const dateTakenStr = attempt.startedAt
      ? new Date(attempt.startedAt).toLocaleDateString()
      : 'July 16, 2026';
    const durationMin = Math.floor((attempt.durationSeconds || 0) / 60);

    return (
      <PageContainer>
        <PageContent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedDetail(null)}
                  style={{
                    color: 'var(--text-muted)',
                    gap: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ArrowLeft size={16} /> Back to Results Directory
                </Button>
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Candidate Audit:{' '}
                    <span style={{ color: 'var(--brand-primary)' }}>{attempt.studentName}</span>
                  </h1>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ID: {attempt.studentId} | Programme: {attempt.programme}
                  </p>
                </div>
              </div>
              <Badge variant={isPassed ? 'success' : 'danger'}>
                {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </Badge>
            </div>

            {banner && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '8px',
                  color: 'var(--brand-primary)',
                  fontSize: '0.875rem',
                }}
              >
                {banner}
              </div>
            )}

            {/* FULL EXAMINATION TELEMETRY SUMMARY HEADER */}
            <Card
              style={{
                padding: '1.75rem',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FileText size={18} color="var(--brand-primary)" />
                Candidate & Examination Audit Telemetry
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Student Name
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {attempt.studentName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Registration Number
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--brand-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {attempt.studentId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Examination Name
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {attempt.assessmentName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Programme / Subject
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {attempt.programme}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date Taken</div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {dateTakenStr}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Time Started / Submitted
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {timeStartedStr} - {timeSubmittedStr}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Duration Used
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {durationMin} mins
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total Questions
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {totalQuestions}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                    Correct Answers
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--success)',
                      marginTop: '2px',
                    }}
                  >
                    {correctCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Wrong Answers</div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--danger)',
                      marginTop: '2px',
                    }}
                  >
                    {wrongCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
                    Unanswered Questions
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--warning)',
                      marginTop: '2px',
                    }}
                  >
                    {unansweredCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)' }}>
                    Final Score & Percentage
                  </div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: isPassed ? 'var(--success)' : 'var(--danger)',
                      marginTop: '2px',
                    }}
                  >
                    {percentage}% ({isPassed ? 'PASS' : 'FAIL'})
                  </div>
                </div>
              </div>
            </Card>

            {/* PER-QUESTION ITEMIZED AUDIT CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                Itemized Question Performance Breakdown ({totalQuestions} Questions)
              </h2>

              {questions.map((q, idx) => (
                <Card
                  key={q.questionId || idx}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface-0)',
                    border: q.isCorrect
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--surface-2)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                        }}
                      >
                        Question {idx + 1}
                      </span>
                      <span>
                        <Badge variant={q.isCorrect ? 'success' : 'danger'}>
                          {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </Badge>
                      </span>
                    </div>

                    <div
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}
                    >
                      Marks Awarded:{' '}
                      <strong style={{ color: q.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                        {q.marksAwarded} / {q.marksAllocated}
                      </strong>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '1rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {q.questionText}
                  </div>

                  {/* Options & Candidate Answers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      backgroundColor: 'var(--surface-1)',
                      padding: '1rem',
                      borderRadius: '10px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Student Selected Answer:
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: q.isCorrect ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {q.studentAnswer || '(Unanswered)'}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Official Correct Answer:
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
                        {q.correctAnswer}
                      </div>
                    </div>
                  </div>

                  {/* Options List breakdown */}
                  {q.options && q.options.length > 0 && (
                    <div
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          marginBottom: '0.2rem',
                        }}
                      >
                        Answer Options Choice List:
                      </div>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = opt === q.studentAnswer;
                        const isRight = opt === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '0.5rem 0.85rem',
                              borderRadius: '6px',
                              backgroundColor: isRight
                                ? 'rgba(16, 185, 129, 0.15)'
                                : isSelected
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'var(--surface-1)',
                              border: isRight
                                ? '1px solid rgba(16, 185, 129, 0.35)'
                                : isSelected
                                  ? '1px solid rgba(239, 68, 68, 0.35)'
                                  : '1px solid var(--border)',
                              fontSize: '0.85rem',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{opt}</span>
                            {isRight && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: 'var(--success)',
                                }}
                              >
                                ✓ Correct Answer
                              </span>
                            )}
                            {isSelected && !isRight && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: 'var(--danger)',
                                }}
                              >
                                ✗ Selected by Student
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Rationale */}
                  {q.explanation && (
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong
                        style={{
                          color: 'var(--brand-primary)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Explanation & Teaching Rationale:
                      </strong>
                      {q.explanation}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  /* LIST OF ATTEMPTS TABLE */
  return (
    <PageContainer>
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              Student Examination Results Audit
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Comprehensive examination performance directory for itemized question audits and
              candidate scores.
            </p>
          </div>

          <Card
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--border)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Programme</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    Assessment Name
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Score</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {att.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {att.studentId}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{att.programme}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{att.assessmentName}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong
                        style={{ color: att.score >= 70 ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {att.score}%
                      </strong>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant={att.status === 'FLAGGED' ? 'danger' : 'success'}>
                        {att.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Button variant="primary" onClick={() => handleSelectAttempt(att.id)}>
                        Audit Detailed Results
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}

export default AssessmentReviewsScreen;
