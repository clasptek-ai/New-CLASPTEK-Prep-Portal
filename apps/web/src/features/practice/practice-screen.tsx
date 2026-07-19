'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { studentPracticeService, PracticeQuestion, PracticeSessionStats } from '../../services/student/practice.service';

export function AdaptivePracticeScreen() {
  const [stats, setStats] = useState<PracticeSessionStats | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentPracticeService.getPracticeStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStartPractice(category: 'ADAPTIVE' | 'TIMED' | 'TOPIC' | 'REVISION' | 'WEAK_TOPIC' | 'RESUME') {
    setLoading(true);
    try {
      const question = await studentPracticeService.startPractice(category);
      setActiveQuestion(question);
      setPracticeMode(category);
      setSelectedOption(null);
      setExplanation(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswerSubmit(option: string) {
    if (!activeQuestion) return;
    setSelectedOption(option);
    try {
      const res = await studentPracticeService.submitAnswer(activeQuestion.id, option);
      setIsCorrect(res.correct);
      setExplanation(res.explanation);
      if (res.correct) {
        setBanner('Correct Answer! Well done.');
      } else {
        setBanner('Incorrect Answer. Review the explanation below.');
      }
      setTimeout(() => setBanner(null), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  function handleNextQuestion() {
    if (practiceMode) {
      handleStartPractice(practiceMode as any);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading practice session questions and logs stats...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Adaptive Practice Arena</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Boost your readiness index scoreboards with specialized training modes</p>
        </div>
        {stats && (
          <Badge variant="warning">Practice Accuracy: {stats.accuracy}%</Badge>
        )}
      </div>

      {banner && (
        <div style={{ padding: '1rem', backgroundColor: isCorrect ? '#10b98120' : '#ef444420', border: `1px solid ${isCorrect ? '#10b98140' : '#ef444440'}`, borderRadius: '8px', color: isCorrect ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
          {banner}
        </div>
      )}

      {!activeQuestion && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Choose Practice Category">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                <Button onClick={() => handleStartPractice('ADAPTIVE')}>Adaptive Session</Button>
                <Button variant="secondary" onClick={() => handleStartPractice('TIMED')}>Timed Practice</Button>
                <Button variant="ghost" onClick={() => handleStartPractice('TOPIC')}>Topic Focus</Button>
                <Button variant="ghost" onClick={() => handleStartPractice('WEAK_TOPIC')}>Weak Topics Review</Button>
                <Button variant="secondary" onClick={() => handleStartPractice('REVISION')}>Revision Practice</Button>
                <Button onClick={() => handleStartPractice('RESUME')}>Resume Session</Button>
              </div>
            </Card>

            <Card title="Practice History Scoreboards">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Date: {h.date}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>Accuracy: {h.score}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card title="Stats Breakdown">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div>Total Questions Attempted: <strong>{stats.attemptedCount}</strong></div>
                <div>Avg Time Per Question: <strong>{stats.averageTimeSeconds}s</strong></div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Strongest Topics:</span>
                  {stats.strongTopics.map((t, idx) => <span key={idx} style={{ marginRight: '0.25rem', marginBottom: '0.25rem', display: 'inline-block' }}><Badge variant="success">{t}</Badge></span>)}
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Weakest focus Areas:</span>
                  {stats.weakTopics.map((t, idx) => <span key={idx} style={{ marginRight: '0.25rem', marginBottom: '0.25rem', display: 'inline-block' }}><Badge variant="danger">{t}</Badge></span>)}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title={`Practice Mode: ${practiceMode?.replace('_', ' ')}`}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>{activeQuestion.text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOption = opt === activeQuestion.answer;
                let btnStyle: React.CSSProperties = {
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #232e48',
                  backgroundColor: isSelected ? 'rgba(37,99,235,0.1)' : '#151d30',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                };

                if (selectedOption) {
                  if (isCorrectOption) {
                    btnStyle.border = '2px solid #10b981';
                    btnStyle.backgroundColor = 'rgba(16,185,129,0.1)';
                  } else if (isSelected) {
                    btnStyle.border = '2px solid #ef4444';
                    btnStyle.backgroundColor = 'rgba(239,68,68,0.1)';
                  }
                }

                return (
                  <button key={i} onClick={() => handleAnswerSubmit(opt)} disabled={!!selectedOption} style={btnStyle}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedOption && (
            <Card title="Review Explanation logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{explanation}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={handleNextQuestion}>Next Question</Button>
                  <Button variant="secondary" onClick={() => setActiveQuestion(null)}>Exit Arena</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
export default AdaptivePracticeScreen;
