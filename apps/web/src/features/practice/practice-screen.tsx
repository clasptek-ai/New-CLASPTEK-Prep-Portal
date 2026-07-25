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
import {
  Zap,
  Target,
  BookOpen,
  Clock,
  Flame,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

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
        setBanner('Correct Answer! +50 Practice Points Earned.');
      } else {
        setBanner('Incorrect Answer. Review the explanation and rate your confidence level below.');
      }
      setTimeout(() => setBanner(null), 4000);
    } catch (e) {
      console.error(e);
    }
  }

  function handleConfidenceSelected(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT') {
    setShowConfidenceModal(false);
    setBanner(`Confidence level recorded as ${level}. Adaptive difficulty adjusted.`);
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
        <h3>Loading adaptive practice session...</h3>
      </div>
    );
  }

  const PRACTICE_MODES = [
    {
      id: 'ADAPTIVE',
      label: 'Adaptive Practice',
      sub: 'Dynamic AI question sizing',
      icon: <Zap size={18} color="#38bdf8" />,
    },
    {
      id: 'SKILL',
      label: 'Skill Building',
      sub: 'Target specific grammar & reading skills',
      icon: <Target size={18} color="#34d399" />,
    },
    {
      id: 'TOPIC',
      label: 'Topic Focus',
      sub: 'Drill questions by topic category',
      icon: <BookOpen size={18} color="#60a5fa" />,
    },
    {
      id: 'TIMED',
      label: 'Timed Simulation',
      sub: 'Exam time constraint practice',
      icon: <Clock size={18} color="#fbbf24" />,
    },
    {
      id: 'WEAK_SKILL',
      label: 'Weakness Booster',
      sub: 'Focus on lowest accuracy topics',
      icon: <Flame size={18} color="#f87171" />,
    },
    {
      id: 'EXAM_BOOSTER',
      label: 'Exam Booster',
      sub: 'High-yield examination items',
      icon: <Award size={18} color="#a78bfa" />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Enterprise Professional Header Banner */}
      <div
        style={{
          padding: '2rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(21, 29, 48, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              textTransform: 'uppercase',
            }}
          >
            ADAPTIVE LEARNING ARENA
          </span>
          <h1
            style={{
              margin: '0.5rem 0 0.25rem',
              fontSize: '1.95rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            Interactive Practice Workspace
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '640px' }}>
            AI-driven skill building, real-time diagnostic evaluation, spaced retention tracking,
            and personalized target management.
          </p>
        </div>

        {stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#34d399',
                  textTransform: 'uppercase',
                }}
              >
                Overall Accuracy
              </div>
              <div
                style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}
              >
                {stats.accuracy}%
              </div>
            </div>
          </div>
        )}
      </div>

      {motivation && <MotivationWidget motivation={motivation} />}
      {dailyGoal && <DailyGoalWidget goal={dailyGoal} />}

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            borderRadius: '10px',
            color: isCorrect ? '#34d399' : '#f87171',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{banner}</span>
        </div>
      )}

      {!activeQuestion && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  marginBottom: '1.25rem',
                }}
              >
                Select Practice Session Mode
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {PRACTICE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleStartPractice(mode.id as any)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1e293b';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f172a';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {mode.icon}
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {mode.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {mode.sub}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <PracticeGoalWidget goals={goals} onSetGoal={handleSetGoal} />
            <RetentionDashboardWidget profiles={retentionProfiles} />
          </div>

          <div>
            <Card
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <TrendingUp size={18} color="#34d399" />
                Performance Telemetry
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                  }}
                >
                  <span>Questions Attempted</span>
                  <strong style={{ color: '#f8fafc' }}>{stats.attemptedCount}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                  }}
                >
                  <span>Avg Time Per Question</span>
                  <strong style={{ color: '#f8fafc' }}>{stats.averageTimeSeconds}s</strong>
                </div>

                <div>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      color: '#34d399',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Strongest Focus Areas
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {stats.strongTopics.map((t, idx) => (
                      <Badge key={idx} variant="success">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      color: '#f87171',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Weakest Focus Areas
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {stats.weakTopics.map((t, idx) => (
                      <Badge key={idx} variant="danger">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ACTIVE QUESTION WORKSPACE */}
      {activeQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            style={{
              padding: '2rem',
              borderRadius: '16px',
              backgroundColor: '#151d30',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Badge variant="info">Mode: {practiceMode?.replace('_', ' ')}</Badge>
              <Button
                variant="secondary"
                onClick={() => setActiveQuestion(null)}
                style={{ color: '#94a3b8' }}
              >
                Exit Arena
              </Button>
            </div>

            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '1.75rem',
                lineHeight: 1.45,
              }}
            >
              {activeQuestion.text}
            </div>

            {/* Answer Choice Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOption = opt === activeQuestion.answer;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSubmit(opt)}
                    disabled={!!selectedOption}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      borderRadius: '10px',
                      border: isSelected
                        ? '2px solid #2563eb'
                        : selectedOption && isCorrectOption
                          ? '2px solid #10b981'
                          : selectedOption && isSelected
                            ? '2px solid #ef4444'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected
                        ? 'rgba(37, 99, 235, 0.15)'
                        : selectedOption && isCorrectOption
                          ? 'rgba(16, 185, 129, 0.15)'
                          : selectedOption && isSelected
                            ? 'rgba(239, 68, 68, 0.15)'
                            : '#0f172a',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      fontSize: '0.925rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span>{opt}</span>
                    {selectedOption && isCorrectOption && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                        ✓ Correct
                      </span>
                    )}
                    {selectedOption && isSelected && !isCorrectOption && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>
                        ✗ Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedOption && showConfidenceModal && (
              <ConfidenceRatingModal onSelectConfidence={handleConfidenceSelected} />
            )}
          </Card>

          {selectedOption && (
            <Card
              style={{
                padding: '1.5rem',
                borderRadius: '14px',
                backgroundColor: '#151d30',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#60a5fa' }}>
                  Explanation & Learning Rationale
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {explanation}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Button
                    variant="primary"
                    onClick={handleNextQuestion}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      gap: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span>Next Question</span>
                    <ArrowRight size={16} />
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveQuestion(null)}>
                    Exit Session
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
