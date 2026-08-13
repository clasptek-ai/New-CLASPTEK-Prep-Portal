'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/ui-components';
import {
  studentPracticeService,
  PracticeSession,
  PracticeAnswerItem,
  StudentSkillProgress,
  CustomSessionParams,
} from '../../services/student/practice.service';
import {
  Zap,
  Target,
  BookOpen,
  Clock,
  Award,
  Bookmark,
  Volume2,
  Brain,
  Headphones,
  PenTool,
  Mic,
  AlertCircle,
  RotateCcw,
  Check,
} from 'lucide-react';

interface ActiveProgrammeData {
  programmeTitle: string;
  examType: string;
  targetScore?: string;
  skills: string[];
}

export function AdaptivePracticeScreen() {
  // Screen Stage: 'SKILL_SELECT' | 'SESSION' | 'REVIEW' | 'INSUFFICIENT_QUESTIONS'
  const [stage, setStage] = useState<
    'SKILL_SELECT' | 'SESSION' | 'REVIEW' | 'INSUFFICIENT_QUESTIONS'
  >('SKILL_SELECT');

  // Student Active Programme Context
  const [programmeData, setProgrammeData] = useState<ActiveProgrammeData>({
    programmeTitle: 'IELTS Academic Prep',
    examType: 'IELTS Academic',
    targetScore: 'Band 7.5+',
    skills: ['Reading', 'Listening', 'Writing', 'Speaking'],
  });

  const [activeTab, setActiveTab] = useState<string>('Reading');

  // Active Session State
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, PracticeAnswerItem>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [itemTimeSeconds, setItemTimeSeconds] = useState<number>(0);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  // Performance Data & Review State
  const [skillProgress, setSkillProgress] = useState<StudentSkillProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load student active programme & skill progress on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/v1/student/active-programme');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProgrammeData({
              programmeTitle: data.programmeTitle,
              examType: data.examType,
              targetScore: data.targetScore,
              skills: data.skills || ['Reading', 'Listening', 'Writing', 'Speaking'],
            });
            if (data.skills && data.skills.length > 0) {
              setActiveTab(data.skills[0]);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load active programme, using defaults');
      }

      const progress = await studentPracticeService.getStudentSkillProgress();
      setSkillProgress(progress || []);
    }
    loadInitialData();
  }, []);

  // Timer Ticking in Session
  useEffect(() => {
    let interval: any = null;
    if (stage === 'SESSION' && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        setItemTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else if (stage === 'SESSION') {
      interval = setInterval(() => {
        setItemTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, secondsRemaining]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Get skill icon
  const getSkillIcon = (skillName: string) => {
    const s = skillName.toLowerCase();
    if (s.includes('reading')) return <BookOpen size={18} />;
    if (s.includes('listening')) return <Headphones size={18} />;
    if (s.includes('writing')) return <PenTool size={18} />;
    if (s.includes('speaking')) return <Mic size={18} />;
    if (s.includes('grammar')) return <Zap size={18} />;
    if (s.includes('math')) return <Target size={18} />;
    return <BookOpen size={18} />;
  };

  // Find ONE primary recommendation based on student's actual performance
  const getRecommendation = () => {
    const matched = skillProgress.find(
      (p) =>
        p.section.toLowerCase() === activeTab.toLowerCase() ||
        p.skill.toLowerCase().includes(activeTab.toLowerCase())
    );

    if (matched && matched.accuracy > 0) {
      return {
        skillTitle: `${matched.section} — ${matched.skill}`,
        accuracy: matched.accuracy,
        statusText: `Your recent accuracy in this skill is ${matched.accuracy}%.`,
        questionCount: 10,
        difficulty: 'Medium',
        section: matched.section,
        skill: matched.skill,
      };
    }

    // Default baseline prompt if student has no previous performance recorded
    return {
      skillTitle: `${activeTab} Practice Check`,
      accuracy: null,
      statusText: 'Start your first practice session to establish your baseline accuracy.',
      questionCount: 10,
      difficulty: 'Medium',
      section: activeTab,
      skill: activeTab,
    };
  };

  const recommendation = getRecommendation();

  // Start Practice Session for chosen skill
  async function handleStartPractice(sectionName: string, skillName?: string) {
    setLoading(true);
    setErrorMessage(null);

    const params: CustomSessionParams = {
      exam: programmeData.examType as any,
      section: sectionName as any,
      skill: skillName || `${sectionName} Practice`,
      difficulty: 'MEDIUM',
      questionCount: 10,
      isTimed: true,
    };

    try {
      const session = await studentPracticeService.createCustomSession(params);
      setActiveSession(session);
      setCurrentIndex(0);
      setSessionAnswers({});
      setSelectedAnswer('');
      setTextAnswer('');
      setSecondsRemaining(session.timeAllowedSeconds || 1800);
      setItemTimeSeconds(0);
      setStage('SESSION');
    } catch (err: any) {
      if (
        err.message?.includes('INSUFFICIENT') ||
        err.message?.includes('Not enough') ||
        err.status === 422
      ) {
        setErrorMessage('Not enough practice questions are currently available for this skill.');
        setStage('INSUFFICIENT_QUESTIONS');
      } else {
        showToast(err.message || 'Unable to start practice session.');
      }
    } finally {
      setLoading(false);
    }
  }

  const currentQuestion = activeSession?.questions[currentIndex];

  // Handle option selection
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

  // Handle bookmark toggle
  async function handleToggleBookmark(qId: string) {
    const nextSet = new Set(bookmarkedSet);
    const isBookmarked = !nextSet.has(qId);
    if (isBookmarked) {
      nextSet.add(qId);
      showToast('Question bookmarked!');
    } else {
      nextSet.delete(qId);
      showToast('Bookmark removed.');
    }
    setBookmarkedSet(nextSet);
    await studentPracticeService.toggleBookmark(qId, isBookmarked);
  }

  // Submit Practice Session
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

  const isWritingSkill =
    activeSession?.section?.toLowerCase().includes('writing') ||
    currentQuestion?.type === 'ESSAY';
  const isSpeakingSkill =
    activeSession?.section?.toLowerCase().includes('speaking') ||
    currentQuestion?.type === 'SPEAKING';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100 font-sans p-2 md:p-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-sky-500 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
          <Bookmark size={16} />
          {toastMessage}
        </div>
      )}

      {/* =========================================================================
          STAGE 1: SKILL SELECTION INTERFACE (CHOOSE SKILL → START PRACTICE)
          ========================================================================= */}
      {stage === 'SKILL_SELECT' && (
        <div className="space-y-8">
          {/* Header & Programme Context Badges */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Practice</h1>
              <p className="text-xs text-slate-400 mt-1">
                Build your confidence one skill at a time.
              </p>
            </div>

            {/* Programme & Target Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400 font-medium">Active Programme:</span>
                <span className="font-bold text-sky-400">{programmeData.programmeTitle}</span>
              </div>
              {programmeData.targetScore && (
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium">Target:</span>
                  <span className="font-bold text-amber-400">{programmeData.targetScore}</span>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC SKILL NAVIGATION TABS */}
          <div className="flex overflow-x-auto pb-2 border-b border-slate-800 gap-2 scrollbar-none">
            {programmeData.skills.map((skillName) => {
              const isActive = activeTab.toLowerCase() === skillName.toLowerCase();
              return (
                <button
                  key={skillName}
                  onClick={() => setActiveTab(skillName)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {getSkillIcon(skillName)}
                  {skillName}
                </button>
              );
            })}
          </div>

          {/* RECOMMENDED PRACTICE CARD */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={16} /> Recommended for you
              </span>
              <Badge variant="info">
                {recommendation.questionCount} questions · {recommendation.difficulty}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{recommendation.skillTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">{recommendation.statusText}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  handleStartPractice(recommendation.section, recommendation.skill)
                }
                disabled={loading}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Starting Session...' : 'Start Practice →'}
              </button>
            </div>
          </div>

          {/* PRACTICE BY SKILL GRID */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Practice by skill
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programmeData.skills.map((skillName) => (
                <div
                  key={skillName}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-800 text-sky-400 rounded-xl">
                        {getSkillIcon(skillName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{skillName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Targeted {skillName.toLowerCase()} practice for {programmeData.programmeTitle}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleStartPractice(skillName, `${skillName} Practice`)}
                      disabled={loading}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      Practice →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: QUESTION PRACTICE SESSION (FOCUSED UX)
          ========================================================================= */}
      {stage === 'SESSION' && activeSession && currentQuestion && (
        <div className="space-y-6">
          {/* Header & Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {programmeData.programmeTitle} — {activeSession.section}
                </span>
                <span className="text-slate-400 font-mono">
                  Question {currentIndex + 1} of {activeSession.totalQuestions}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Clock size={14} />
                  <span>{formatTimer(secondsRemaining)}</span>
                </div>

                {/* Bookmark Toggle */}
                <button
                  onClick={() => handleToggleBookmark(currentQuestion.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    bookmarkedSet.has(currentQuestion.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title="Bookmark Question"
                >
                  <Bookmark
                    size={15}
                    fill={bookmarkedSet.has(currentQuestion.id) ? '#f59e0b' : 'transparent'}
                  />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / activeSession.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Container */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            {/* Reading Passage if available */}
            {currentQuestion.passageText && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed space-y-2">
                <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Reading Passage
                </div>
                <div>{currentQuestion.passageText}</div>
              </div>
            )}

            {/* Listening Audio Player if available */}
            {currentQuestion.audioUrl && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Volume2 size={16} className="text-sky-400" /> Listening Prompt Audio
                </div>
                <audio controls className="w-full h-8">
                  <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Question Prompt Text */}
            <div className="text-base font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </div>

            {/* MCQ / Radio Options (Only for non-writing / non-speaking) */}
            {!isWritingSkill &&
              !isSpeakingSkill &&
              currentQuestion.options &&
              currentQuestion.options.length > 0 && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all border ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                            : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Writing Task Text Area (NO MCQ Radio Buttons) */}
            {isWritingSkill && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium">
                  Compose your response clearly in the space below:
                </div>
                <textarea
                  rows={8}
                  value={textAnswer}
                  onChange={(e) => {
                    setTextAnswer(e.target.value);
                    handleSelectOption(e.target.value);
                  }}
                  placeholder="Type your essay response here..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                />
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Words: {textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0}
                </div>
              </div>
            )}

            {/* Speaking Task Prompt Interface (NO MCQ Radio Buttons) */}
            {isSpeakingSkill && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                  <Mic size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Oral Response Interface</h4>
                  <p className="text-[11px] text-slate-400">
                    Record your speaking response or summarize key notes below.
                  </p>
                </div>
                <textarea
                  rows={4}
                  value={textAnswer}
                  onChange={(e) => {
                    setTextAnswer(e.target.value);
                    handleSelectOption(e.target.value);
                  }}
                  placeholder="Type oral response transcript or key speaking points..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  const prevIdx = Math.max(0, currentIndex - 1);
                  setCurrentIndex(prevIdx);
                  const prevQ = activeSession.questions[prevIdx];
                  setSelectedAnswer(sessionAnswers[prevQ.id]?.userAnswer || '');
                }}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              {currentIndex < activeSession.totalQuestions - 1 ? (
                <button
                  onClick={() => {
                    const nextIdx = Math.min(activeSession.totalQuestions - 1, currentIndex + 1);
                    setCurrentIndex(nextIdx);
                    const nextQ = activeSession.questions[nextIdx];
                    setSelectedAnswer(sessionAnswers[nextQ.id]?.userAnswer || '');
                  }}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleFinishSession}
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Practice'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: INSUFFICIENT QUESTIONS STATE
          ========================================================================= */}
      {stage === 'INSUFFICIENT_QUESTIONS' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertCircle size={24} />
          </div>

          <h3 className="text-lg font-bold text-white">
            Not enough practice questions are currently available for this skill.
          </h3>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Questions for <strong className="text-white">{activeTab}</strong> under{' '}
            <strong className="text-sky-400">{programmeData.programmeTitle}</strong> are currently
            being published. Please choose another skill to practise.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setStage('SKILL_SELECT')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Choose Another Skill
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: POST-SUBMISSION RESULTS BREAKDOWN
          ========================================================================= */}
      {stage === 'REVIEW' && activeSession && activeSession.scoreResult && (
        <div className="space-y-6">
          {/* Hero Result Summary */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
            <Award size={48} className="text-sky-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Practice Complete</h2>
            <p className="text-xs text-slate-400">
              {programmeData.programmeTitle} — {activeSession.section}
            </p>

            <div className="flex justify-center items-center gap-6">
              <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
                <div className="text-2xl font-black text-sky-400 mt-0.5">
                  {activeSession.scoreResult.rawScore} / {activeSession.scoreResult.totalQuestions}
                </div>
              </div>

              <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {activeSession.scoreResult.percentage}%
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300">
              Performance Level: <strong className="text-sky-300">{activeSession.scoreResult.label}</strong> ({activeSession.scoreResult.bandOrScale})
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setStage('SKILL_SELECT')}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                Practice Again
              </button>
              <button
                onClick={() => (window.location.href = '/student/results')}
                className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Back to My Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdaptivePracticeScreen;
