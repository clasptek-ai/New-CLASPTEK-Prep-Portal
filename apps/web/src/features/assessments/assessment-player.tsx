'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { studentMockExamsService, MockExam } from '../../services/student/mock-exams.service';

export function AssessmentPlayerScreen() {
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedCompletedExam, setSelectedCompletedExam] = useState<MockExam | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentMockExamsService.getMockExams();
        setMockExams(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  async function handleLaunch(id: string) {
    setLoading(true);
    try {
      const res = await studentMockExamsService.startExamSession(id);
      if (res.success) {
        setActiveSessionId(id);
        setCurrentQuestion(0);
        setAnswers({});
        setTimeLeft(1800);
        showBanner('Exam session initialized by Assessment Runtime!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerSelect(ans: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: ans }));
  }

  function handleFinish() {
    showBanner('Mock Exam submitted to runtime evaluators!');
    setMockExams((prev) =>
      prev.map((ex) =>
        ex.id === activeSessionId
          ? {
              ...ex,
              status: 'COMPLETED',
              score: 85,
              percentile: 90,
              timeUsed: '42 mins',
              sectionScores: { listening: 8.5, reading: 8.0, writing: 8.0, speaking: 8.5 },
              weakObjectives: ['Grammar Relative syntax Modifiers'],
              recommendations: 'Dedicate 10 minutes to scanning exercises.',
              incorrectQuestions: [14, 25, 36],
            }
          : ex
      )
    );
    setActiveSessionId(null);
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  const mockQuestions = [
    {
      text: 'Which word is a synonym of "diligent"?',
      options: ['Lazy', 'Industrious', 'Careless', 'Passive'],
    },
    {
      text: 'Complete the sentence: "By next week, she _______ completed the project."',
      options: ['will have', 'has', 'would', 'is'],
    },
    {
      text: 'Choose the correct spelling:',
      options: ['Accomodate', 'Acommodate', 'Accommodate', 'Acomodate'],
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Connecting to Assessment Runtime...</h3>
      </div>
    );
  }

  if (activeSessionId) {
    const q = mockQuestions[currentQuestion];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Assessment Session Active (Runtime Player)
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Auto-saving progress logs active...
            </p>
          </div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#f87171',
              backgroundColor: 'rgba(239,68,68,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            Timer: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>

        <Card title={`Question ${currentQuestion + 1} of ${mockQuestions.length}`}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>{q.text}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {q.options.map((opt, i) => {
              const isSelected = answers[currentQuestion] === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(opt)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #232e48',
                    backgroundColor: isSelected ? 'rgba(37,99,235,0.1)' : '#151d30',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <Button
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
          >
            Previous
          </Button>
          {currentQuestion < mockQuestions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Finish & Submit</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Mock Examinations & Assessments
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Inspect test histories, launch mock exams sessions, and read AI feedback
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

      {selectedCompletedExam && (
        <Card
          title={`Mock Diagnostic: ${selectedCompletedExam.title}`}
          actions={<Button onClick={() => setSelectedCompletedExam(null)}>Close Diagnostic</Button>}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: '#0b0f19',
                borderRadius: '6px',
              }}
            >
              <div>
                Overall Score: <strong>{selectedCompletedExam.score}%</strong>
              </div>
              <div>
                Percentile: <strong>{selectedCompletedExam.percentile}th</strong>
              </div>
              <div>
                Time Used: <strong>{selectedCompletedExam.timeUsed}</strong>
              </div>
              <div>
                Incorrect Count: <strong>{selectedCompletedExam.incorrectQuestions?.length}</strong>
              </div>
            </div>

            <div>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Section Scores:</span>
              <div
                style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem', color: '#94a3b8' }}
              >
                <span>
                  Listening: <strong>{selectedCompletedExam.sectionScores?.listening}</strong>
                </span>
                <span>
                  Reading: <strong>{selectedCompletedExam.sectionScores?.reading}</strong>
                </span>
                <span>
                  Writing: <strong>{selectedCompletedExam.sectionScores?.writing}</strong>
                </span>
                <span>
                  Speaking: <strong>{selectedCompletedExam.sectionScores?.speaking}</strong>
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Weak Objectives:</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {selectedCompletedExam.weakObjectives?.map((o, idx) => (
                  <Badge key={idx} variant="danger">
                    {o}
                  </Badge>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem',
                borderLeft: '3px solid #f59e0b',
                backgroundColor: '#0b0f19',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: '#f59e0b',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                AI Feedback Recommendation:
              </span>
              {selectedCompletedExam.recommendations}
            </div>

            <div>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Incorrect Questions:</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {selectedCompletedExam.incorrectQuestions?.map((q, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#ef444415',
                      border: '1px solid #ef444430',
                      color: '#ef4444',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Q{q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {mockExams.map((ex) => (
          <Card
            key={ex.id}
            title={ex.title}
            actions={
              <Badge variant={ex.status === 'COMPLETED' ? 'success' : 'info'}>{ex.status}</Badge>
            }
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Duration: {ex.durationMinutes} mins | Questions: {ex.questionCount}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {ex.status === 'COMPLETED' ? (
                  <Button onClick={() => setSelectedCompletedExam(ex)}>Review Results</Button>
                ) : (
                  <Button onClick={() => handleLaunch(ex.id)}>Start Exam Session</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default AssessmentPlayerScreen;
