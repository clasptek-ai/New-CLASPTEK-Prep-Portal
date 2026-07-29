'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import {
  studentPracticeService,
  PracticeSession,
  PracticeAnswerItem,
  StudentSkillProgress,
  CustomSessionParams,
} from '../../services/student/practice.service';
import {
  ExamType,
  SectionType,
  QuestionType,
  DifficultyLevel,
} from '../../services/admin/questions.service';
import {
  Zap,
  Target,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  Bookmark,
  RotateCcw,
  Volume2,
  AlertTriangle,
  Play,
  Check,
  Brain,
  BarChart3,
  Sliders,
} from 'lucide-react';

export function AdaptivePracticeScreen() {
  // Screen Stage: 'CONFIG' | 'SESSION' | 'REVIEW'
  const [stage, setStage] = useState<'CONFIG' | 'SESSION' | 'REVIEW'>('CONFIG');

  // Stage 1: Custom Session Configurator Form (Epic 3.1)
  const [selectedExam, setSelectedExam] = useState<ExamType>('IELTS Academic');
  const [selectedSection, setSelectedSection] = useState<SectionType>('Reading');
  const [selectedSkill, setSelectedSkill] = useState<string>('Matching Headings');
  const [selectedType, setSelectedType] = useState<QuestionType | 'ANY'>('ANY');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'ANY'>('MEDIUM');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Stage 2: Active Session State (Epics 3.2 & 3.3)
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, PracticeAnswerItem>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [itemTimeSeconds, setItemTimeSeconds] = useState<number>(0);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  // Stage 3: Student Weak Skills & Review (Epics 3.5 & 3.6)
  const [skillProgress, setSkillProgress] = useState<StudentSkillProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      const data = await studentPracticeService.getStudentSkillProgress();
      setSkillProgress(data);
    }
    loadProgress();
  }, []);

  // Smart Timer Ticking
  useEffect(() => {
    let interval: any = null;
    if (stage === 'SESSION' && isTimed && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        setItemTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      interval = setInterval(() => {
        setItemTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, isTimed, secondsRemaining]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Handle Launch Custom Session (Epic 3.1)
  async function handleStartCustomSession() {
    setLoading(true);
    const params: CustomSessionParams = {
      exam: selectedExam,
      section: selectedSection,
      skill: selectedSkill,
      questionType: selectedType,
      difficulty: selectedDifficulty,
      questionCount,
      isTimed,
    };

    const session = await studentPracticeService.createCustomSession(params);
    setActiveSession(session);
    setCurrentIndex(0);
    setSessionAnswers({});
    setSelectedAnswer('');
    setEssayAnswer('');
    setSecondsRemaining(session.timeAllowedSeconds || 1800);
    setItemTimeSeconds(0);
    setStage('SESSION');
    setLoading(false);
  }

  const currentQuestion = activeSession?.questions[currentIndex];

  // Record Answer for Current Question
  function handleSelectOption(option: string) {
    setSelectedAnswer(option);
    if (!currentQuestion) return;

    const isCorrect = option === currentQuestion.correctAnswer;
    setSessionAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswer: option,
        isCorrect,
        timeSpentSeconds: itemTimeSeconds,
        bookmarked: bookmarkedSet.has(currentQuestion.id),
      },
    }));
  }

  // Toggle Question Bookmark (Epic 3.7)
  async function handleToggleBookmark(qId: string) {
    const nextSet = new Set(bookmarkedSet);
    const isBookmarked = !nextSet.has(qId);
    if (isBookmarked) {
      nextSet.add(qId);
      showToast('Question saved to bookmarks revision list!');
    } else {
      nextSet.delete(qId);
      showToast('Question removed from bookmarks.');
    }
    setBookmarkedSet(nextSet);
    await studentPracticeService.toggleBookmark(qId, isBookmarked);
  }

  // Finish Practice Session & Generate Band Score (Epic 3.4)
  async function handleFinishSession() {
    if (!activeSession) return;
    setLoading(true);

    const totalTimeSpent = activeSession.questions.length * 45;
    const completedSession = await studentPracticeService.submitSession(
      activeSession.id,
      sessionAnswers,
      totalTimeSpent,
      activeSession.exam
    );

    setActiveSession(completedSession);
    setStage('REVIEW');
    setLoading(false);
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Bookmark size={18} />
          {toastMessage}
        </div>
      )}

      {/* STAGE 1: PRACTICE SESSION ENGINE LAUNCHER (EPIC 3.1) */}
      {stage === 'CONFIG' && (
        <>
          {/* Header */}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <Sliders size={24} />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Customized Practice Engine
                </h1>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Generate unlimited targeted practice sessions for IELTS, TOEFL, SAT, CELPIP &
                English Proficiency.
              </p>
            </div>
          </div>

          {/* Practice Session Generator Controls */}
          <Card
            style={{
              padding: '1.75rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Zap size={20} color="#fbbf24" />
              Configure Practice Session Parameters
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* 1. Target Exam */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Target Examination *
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value as ExamType)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="IELTS Academic">IELTS Academic</option>
                  <option value="IELTS General Training">IELTS General Training</option>
                  <option value="TOEFL iBT">TOEFL iBT</option>
                  <option value="SAT">SAT</option>
                  <option value="CELPIP">CELPIP</option>
                  <option value="English Proficiency">English Proficiency</option>
                </select>
              </div>

              {/* 2. Section */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Exam Section *
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value as SectionType)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Reading">Reading</option>
                  <option value="Listening">Listening</option>
                  <option value="Writing">Writing</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Math">Math</option>
                  <option value="Grammar">Grammar</option>
                </select>
              </div>

              {/* 3. Target Skill */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Target Skill Area *
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Matching Headings">Matching Headings</option>
                  <option value="True / False / Not Given">True / False / Not Given</option>
                  <option value="Integrated Writing Logic">Integrated Writing Logic</option>
                  <option value="Quadratic Equations & Math">Quadratic Equations & Math</option>
                  <option value="Interactive Speaking Advice">Interactive Speaking Advice</option>
                  <option value="General Skills Synthesis">General Skills Synthesis</option>
                </select>
              </div>

              {/* 4. Question Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Question Format
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as QuestionType | 'ANY')}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="ANY">Any Question Format</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</option>
                  <option value="FILL_IN_BLANK">Fill in Blank</option>
                  <option value="ESSAY">Essay Task</option>
                  <option value="SPEAKING">Speaking Task</option>
                </select>
              </div>

              {/* 5. Difficulty */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'ANY')}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="ANY">Adaptive Mix</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              {/* 6. Question Count & Timing */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Session Length (Questions)
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value={5}>5 Questions (Quick Check)</option>
                  <option value={10}>10 Questions (Standard)</option>
                  <option value={15}>15 Questions (Intensive)</option>
                  <option value={20}>20 Questions (Full Section Practice)</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                }}
              >
                <input
                  type="checkbox"
                  checked={isTimed}
                  onChange={(e) => setIsTimed(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <span>Enable Exam Smart Countdown Timer (Simulate Test Conditions)</span>
              </label>

              <Button
                variant="primary"
                onClick={handleStartCustomSession}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.75rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Play size={18} />
                {loading ? 'Generating Session...' : 'Start Practice Session'}
              </Button>
            </div>
          </Card>

          {/* Student Weakness Detection Widget (Epic 3.6) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Brain size={20} color="#ec4899" />
              Skill Diagnostic & Weakness Tracker
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {skillProgress.map((prog, idx) => (
                <Card
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {prog.skill}
                    </span>
                    <Badge
                      variant={
                        prog.status === 'MASTERED'
                          ? 'success'
                          : prog.status === 'DEVELOPING'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {prog.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span>Exam: {prog.exam}</span>
                    <span>
                      Accuracy: <strong>{prog.accuracy}%</strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#1e293b',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${prog.accuracy}%`,
                        height: '100%',
                        backgroundColor:
                          prog.accuracy >= 80
                            ? '#10b981'
                            : prog.accuracy >= 60
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedExam(prog.exam);
                      setSelectedSection(prog.section);
                      setSelectedSkill(prog.skill);
                      handleStartCustomSession();
                    }}
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    Target This Weakness <ArrowRight size={14} />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* STAGE 2: UNIVERSAL QUESTION DELIVERY ENGINE (EPICS 3.2 & 3.3) */}
      {stage === 'SESSION' && activeSession && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Session Progress Bar & Smart Timer */}
          <Card
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Badge variant="primary">{activeSession.exam}</Badge>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                Question {currentIndex + 1} of {activeSession.totalQuestions}
              </span>
            </div>

            {/* Smart Timer Display */}
            {isTimed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: secondsRemaining < 300 ? '#ef4444' : '#38bdf8',
                  backgroundColor: '#161e2e',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                }}
              >
                <Clock size={18} />
                <span>Timer: {formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleBookmark(currentQuestion.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: bookmarkedSet.has(currentQuestion.id) ? '#fbbf24' : '#cbd5e1',
              }}
            >
              <Star
                size={16}
                fill={bookmarkedSet.has(currentQuestion.id) ? '#fbbf24' : 'transparent'}
              />
              {bookmarkedSet.has(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </Card>

          {/* Question Display Card */}
          <Card
            style={{
              padding: '1.75rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Metadata Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge variant="info">{currentQuestion.section}</Badge>
              <Badge variant="neutral">{currentQuestion.skill}</Badge>
              <Badge variant="warning">{currentQuestion.difficulty}</Badge>
            </div>

            {/* Question Text */}
            <div
              style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.6 }}
            >
              {currentQuestion.text}
            </div>

            {/* MCQ Options Renderer */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                        border: '1px solid',
                        borderColor: isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#60a5fa' : '#f8fafc',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? '#3b82f6' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6',
                            }}
                          />
                        )}
                      </div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Essay Input Renderer */}
            {currentQuestion.type === 'ESSAY' && (
              <textarea
                rows={6}
                value={essayAnswer}
                onChange={(e) => {
                  setEssayAnswer(e.target.value);
                  handleSelectOption(e.target.value);
                }}
                placeholder="Type your essay response here..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            )}

            {/* Session Navigation Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                Previous Question
              </Button>

              {currentIndex < activeSession.totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(activeSession.totalQuestions - 1, prev + 1))
                  }
                >
                  Next Question
                </Button>
              ) : (
                <Button variant="success" onClick={handleFinishSession} disabled={loading}>
                  Submit & Score Session
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 3: REVIEW MODE & BAND SCORE REPORT (EPICS 3.4 & 3.5) */}
      {stage === 'REVIEW' && activeSession && activeSession.scoreResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Score Result Hero Card */}
          <Card
            style={{
              padding: '2rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Award size={48} color="#3b82f6" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Session Score Result
            </h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399' }}>
              {activeSession.scoreResult.bandOrScale}
            </div>
            <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
              Classification: <strong>{activeSession.scoreResult.label}</strong> (
              {activeSession.scoreResult.percentage}% Accuracy)
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button
                variant="primary"
                onClick={() => setStage('CONFIG')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RotateCcw size={16} /> Practice Again
              </Button>
            </div>
          </Card>

          {/* Question Breakdown List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Detailed Question Review & Explanations
            </h3>

            {activeSession.questions.map((q, idx) => {
              const ans = activeSession.answers[q.id];
              const isCorrect = ans?.isCorrect;

              return (
                <Card
                  key={q.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#111827',
                    border: '1px solid',
                    borderColor: isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      Question #{idx + 1} ({q.code})
                    </span>
                    <Badge variant={isCorrect ? 'success' : 'danger'}>
                      {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                    {q.text}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Your Answer:{' '}
                    <strong style={{ color: isCorrect ? '#34d399' : '#fca5a5' }}>
                      {ans?.userAnswer || 'Not Answered'}
                    </strong>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Correct Answer: <strong style={{ color: '#34d399' }}>{q.correctAnswer}</strong>
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        backgroundColor: '#161e2e',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                      }}
                    >
                      <strong>Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdaptivePracticeScreen;
