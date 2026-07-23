'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import {
  studentPracticeService,
  PracticeQuestion,
  PracticeSessionStats,
} from '../../services/student/practice.service';
import { PracticeGoalWidget, PracticeGoalData } from '../../components/ui/practice-goal-widget';
import {
  RetentionDashboardWidget,
  RetentionProfileData,
} from '../../components/ui/retention-dashboard-widget';
import { ConfidenceRatingModal } from '../../components/ui/confidence-rating-modal';
import { DailyGoalWidget, DailyGoalData } from '../../components/ui/daily-goal-widget';
import { MotivationWidget, MotivationData } from '../../components/ui/motivation-widget';

export function AdaptivePracticeScreen() {
  const [stats, setStats] = useState<PracticeSessionStats | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);

  // Addendum States
  const [goals, setGoals] = useState<PracticeGoalData[]>([]);
  const [retentionProfiles] = useState<RetentionProfileData[]>([]);
  const [dailyGoal] = useState<DailyGoalData | null>({
    targetQuestions: 20,
    targetPassages: 2,
    completedQuestions: 8,
    timedPracticeRequired: true,
    vocabularyReviewRequired: false,
    status: 'IN_PROGRESS',
  });
  const [motivation] = useState<MotivationData | null>({
    dailyStreak: 4,
    weeklyStreak: 1,
    longestStreak: 7,
    practicePoints: 180,
    xp: 450,
    badges: ['7-Day Practice Streak', 'Grammar Master'],
  });

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

  async function handleStartPractice(
    category:
      | 'ADAPTIVE'
      | 'SKILL'
      | 'TOPIC'
      | 'REVIEW'
      | 'TIMED'
      | 'UNTIMED'
      | 'CHALLENGE'
      | 'WEAK_SKILL'
      | 'DAILY'
      | 'EXAM_BOOSTER'
      | 'REVISION'
      | 'RESUME'
  ) {
    setLoading(true);
    try {
      const question = await studentPracticeService.startPractice(category as any);
      setActiveQuestion(question);
      setPracticeMode(category);
      setSelectedOption(null);
      setExplanation(null);
      setShowConfidenceModal(false);
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
      setShowConfidenceModal(true);
      if (res.correct) {
        setBanner('Correct Answer! +50 XP Earned');
      } else {
        setBanner('Incorrect Answer. Review explanation and rate confidence below.');
      }
      setTimeout(() => setBanner(null), 4000);
    } catch (e) {
      console.error(e);
    }
  }

  function handleConfidenceSelected(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT') {
    setShowConfidenceModal(false);
    setBanner(`Confidence rated as ${level}. Adaptive difficulty adjusted!`);
    setTimeout(() => setBanner(null), 3000);
  }

  function handleNextQuestion() {
    if (practiceMode) {
      handleStartPractice(practiceMode as any);
    }
  }

  function handleSetGoal(type: string, title: string, value: number) {
    const newGoal: PracticeGoalData = {
      id: 'g-' + Date.now(),
      goalType: type,
      goalTitle: title,
      targetValue: value,
      status: 'ACTIVE',
    };
    setGoals((prev) => [newGoal, ...prev]);
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Adaptive Practice Arena V2
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Multi-mode training, spaced retention tracking, and motivation engine
          </p>
        </div>
        {stats && <Badge variant="warning">Practice Accuracy: {stats.accuracy}%</Badge>}
      </div>

      {motivation && <MotivationWidget motivation={motivation} />}
      {dailyGoal && <DailyGoalWidget goal={dailyGoal} />}

      {banner && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: isCorrect ? '#10b98120' : '#ef444420',
            border: `1px solid ${isCorrect ? '#10b98140' : '#ef444440'}`,
            borderRadius: '8px',
            color: isCorrect ? '#10b981' : '#ef4444',
            fontSize: '0.85rem',
          }}
        >
          {banner}
        </div>
      )}

      {!activeQuestion && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Choose Practice Session Mode (11 Supported Modes)">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <Button onClick={() => handleStartPractice('ADAPTIVE')}>Adaptive Practice</Button>
                <Button variant="secondary" onClick={() => handleStartPractice('SKILL')}>
                  Skill Practice
                </Button>
                <Button variant="ghost" onClick={() => handleStartPractice('TOPIC')}>
                  Topic Practice
                </Button>
                <Button variant="secondary" onClick={() => handleStartPractice('REVIEW')}>
                  Review Practice
                </Button>
                <Button variant="secondary" onClick={() => handleStartPractice('TIMED')}>
                  Timed Practice
                </Button>
                <Button variant="ghost" onClick={() => handleStartPractice('UNTIMED')}>
                  Untimed Practice
                </Button>
                <Button variant="primary" onClick={() => handleStartPractice('CHALLENGE')}>
                  Challenge Mode
                </Button>
                <Button variant="ghost" onClick={() => handleStartPractice('WEAK_SKILL')}>
                  Weak Skill Practice
                </Button>
                <Button variant="secondary" onClick={() => handleStartPractice('DAILY')}>
                  Daily Practice
                </Button>
                <Button variant="primary" onClick={() => handleStartPractice('EXAM_BOOSTER')}>
                  Exam Booster
                </Button>
                <Button variant="secondary" onClick={() => handleStartPractice('REVISION')}>
                  Revision Mode
                </Button>
                <Button onClick={() => handleStartPractice('RESUME')}>Resume Session</Button>
              </div>
            </Card>

            <PracticeGoalWidget goals={goals} onSetGoal={handleSetGoal} />
            <RetentionDashboardWidget profiles={retentionProfiles} />
          </div>

          <div>
            <Card title="Stats Breakdown">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <div>
                  Total Questions Attempted: <strong>{stats.attemptedCount}</strong>
                </div>
                <div>
                  Avg Time Per Question: <strong>{stats.averageTimeSeconds}s</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Strongest Topics:
                  </span>
                  {stats.strongTopics.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        marginRight: '0.25rem',
                        marginBottom: '0.25rem',
                        display: 'inline-block',
                      }}
                    >
                      <Badge variant="success">{t}</Badge>
                    </span>
                  ))}
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Weakest Focus Areas:
                  </span>
                  {stats.weakTopics.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        marginRight: '0.25rem',
                        marginBottom: '0.25rem',
                        display: 'inline-block',
                      }}
                    >
                      <Badge variant="danger">{t}</Badge>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title={`Practice Mode: ${practiceMode?.replace('_', ' ')}`}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {activeQuestion.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOption = opt === activeQuestion.answer;
                const btnStyle: React.CSSProperties = {
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  borderRadius: '8px',
                  border: isSelected
                    ? '2px solid #2563eb'
                    : selectedOption && isCorrectOption
                      ? '2px solid #10b981'
                      : selectedOption && isSelected
                        ? '2px solid #ef4444'
                        : '1px solid #232e48',
                  backgroundColor: isSelected
                    ? 'rgba(37,99,235,0.1)'
                    : selectedOption && isCorrectOption
                      ? 'rgba(16,185,129,0.1)'
                      : selectedOption && isSelected
                        ? 'rgba(239,68,68,0.1)'
                        : '#151d30',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                };

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSubmit(opt)}
                    disabled={!!selectedOption}
                    style={btnStyle}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOption && showConfidenceModal && (
              <ConfidenceRatingModal onSelectConfidence={handleConfidenceSelected} />
            )}
          </Card>

          {selectedOption && (
            <Card title="Review Explanation logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{explanation}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={handleNextQuestion}>Next Question</Button>
                  <Button variant="secondary" onClick={() => setActiveQuestion(null)}>
                    Exit Arena
                  </Button>
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
