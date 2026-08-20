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
  Bookmark,
  Volume2,
  Brain,
  Headphones,
  PenTool,
  Mic,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
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
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [itemTimeSeconds, setItemTimeSeconds] = useState<number>(0);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  // Active Passage Tab State (for dual-pane reading mode)
  const [activePassageIndex, setActivePassageIndex] = useState<number>(0);

  // Performance Data & Review State
  const [skillProgress, setSkillProgress] = useState<StudentSkillProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);

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
        questionCount: activeTab.toLowerCase().includes('reading') ? 40 : 10,
        difficulty: 'Intermediate',
        section: matched.section,
        skill: matched.skill,
      };
    }

    return {
      skillTitle: `${activeTab} Practice Check`,
      accuracy: null,
      statusText: 'Start your practice session to establish your performance and band score.',
      questionCount: activeTab.toLowerCase().includes('reading') ? 40 : 10,
      difficulty: 'Intermediate',
      section: activeTab,
      skill: activeTab,
    };
  };

  const _recommendation = getRecommendation();

  // Start Practice Session for chosen skill
  async function handleStartPractice(sectionName: string, skillName?: string) {
    setLoading(true);
    setErrorMessage(null);

    const isReading = sectionName.toLowerCase().includes('reading');
    const qCount = isReading ? 40 : 10;

    const params: CustomSessionParams = {
      exam: programmeData.examType as any,
      section: sectionName as any,
      skill: skillName || `${sectionName} Practice`,
      difficulty: 'MEDIUM',
      questionCount: qCount,
      isTimed: true,
    };

    try {
      const session = await studentPracticeService.createCustomSession(params);
      setActiveSession(session);
      setCurrentIndex(0);
      setSessionAnswers({});
      setSelectedAnswer('');
      setTextAnswer('');
      setSecondsRemaining(session.timeAllowedSeconds || (isReading ? 3600 : 1800));
      setItemTimeSeconds(0);
      setActivePassageIndex(0);
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

  // Derive unique passages in the current session
  const sessionPassages = React.useMemo(() => {
    if (!activeSession) return [];
    const map = new Map<
      string,
      { code: string; title: string; text: string; questionIndices: number[] }
    >();
    activeSession.questions.forEach((q, idx) => {
      const pCode = q.passageCode || q.passageId || 'PAS-READ-001';
      if (!map.has(pCode)) {
        map.set(pCode, {
          code: pCode,
          title: q.passageTitle || `Passage ${map.size + 1}`,
          text: q.passageText || '',
          questionIndices: [idx],
        });
      } else {
        map.get(pCode)!.questionIndices.push(idx);
        if (!map.get(pCode)!.text && q.passageText) {
          map.get(pCode)!.text = q.passageText;
        }
      }
    });
    return Array.from(map.values());
  }, [activeSession]);

  // Keep passage index in sync with current question
  useEffect(() => {
    if (sessionPassages.length > 0 && currentQuestion) {
      const pIdx = sessionPassages.findIndex((p) => p.questionIndices.includes(currentIndex));
      if (pIdx !== -1 && pIdx !== activePassageIndex) {
        setActivePassageIndex(pIdx);
      }
    }
  }, [currentIndex, currentQuestion, sessionPassages]);

  // Sync selectedAnswer / textAnswer when navigating questions
  useEffect(() => {
    if (currentQuestion) {
      const existing = sessionAnswers[currentQuestion.id]?.userAnswer || '';
      setSelectedAnswer(existing);
      setTextAnswer(existing);
    }
  }, [currentIndex, currentQuestion]);

  // Handle option selection
  function handleSelectOption(answerVal: string) {
    setSelectedAnswer(answerVal);
    setTextAnswer(answerVal);
    if (!currentQuestion) return;

    const isCorrect =
      answerVal.trim().toLowerCase() === (currentQuestion.correctAnswer || '').trim().toLowerCase();
    setSessionAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswer: answerVal,
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

    const totalTimeSpent = (activeSession.timeAllowedSeconds || 3600) - secondsRemaining;
    const completedSession = await studentPracticeService.submitSession(
      activeSession.id,
      sessionAnswers,
      Math.max(1, totalTimeSpent),
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

  const isWritingSkill = activeSession?.section.toLowerCase().includes('writing');
  const _isSpeakingSkill = activeSession?.section.toLowerCase().includes('speaking');
  const isReadingSkill =
    activeSession?.section.toLowerCase().includes('reading') || sessionPassages.length > 0;

  const currentPassage = sessionPassages[activePassageIndex] || sessionPassages[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* =========================================================================
          STAGE 1: SKILL SELECTION & ADAPTIVE HUB
          ========================================================================= */}
      {stage === 'SKILL_SELECT' && (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Student Practice Arena
              </span>
              <h1 className="text-2xl font-black text-white mt-1">
                {programmeData.programmeTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Full-length IELTS Academic Reading practice with authentic passages, question
                groups, and official band scoring.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {programmeData.targetScore && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium">Target Score:</span>
                  <span className="font-bold text-amber-400">{programmeData.targetScore}</span>
                </div>
              )}
            </div>
          </div>

          {/* SKILL NAVIGATION TABS */}
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

          {/* RECOMMENDED FULL IELTS READING PRACTICE CARD */}
          <div className="bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={16} /> Featured Authentic IELTS Practice Test
              </span>
              <Badge variant="info">3 Passages · 40 Questions · 60 Mins</Badge>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                IELTS Academic Reading Practice Test 1
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Includes: Passage 1 (The Public Library Movement), Passage 2 (Circadian Rhythms &
                Cognitive Performance), and Passage 3 (Solar Geoengineering). Features Matching
                Headings, True/False/Not Given, Summary Completion, and Note Completion with zero
                duplicate instructions.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => handleStartPractice('Reading', 'IELTS Reading Full Practice Test')}
                disabled={loading}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Preparing Test Engine...' : 'Start Full 40-Question Practice Test →'}
              </button>
            </div>
          </div>

          {/* PRACTICE BY SKILL GRID */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Available Exam Sections
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
                        <h4 className="text-sm font-bold text-white">{skillName} Practice</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {skillName.toLowerCase().includes('reading')
                            ? 'Dual-pane split interface with 3 reading passages and 40 questions.'
                            : `Targeted ${skillName.toLowerCase()} practice modules.`}
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
                      Launch Practice →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: FOCUSED PRACTICE SESSION (SPLIT-PANE DUAL LAYOUT)
          ========================================================================= */}
      {stage === 'SESSION' && activeSession && currentQuestion && (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-4">
          {/* Top Session Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">
                  {programmeData.programmeTitle} — {activeSession.section}
                </span>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>
                    Question {currentIndex + 1} of {activeSession.totalQuestions}
                  </span>
                  {currentQuestion.groupTitle && (
                    <>
                      <span>•</span>
                      <span className="text-sky-400 font-medium">{currentQuestion.groupTitle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock size={15} />
                <span>{formatTimer(secondsRemaining)} remaining</span>
              </div>

              <button
                onClick={() => handleToggleBookmark(currentQuestion.id)}
                className={`p-2 rounded-xl border transition-all ${
                  bookmarkedSet.has(currentQuestion.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Bookmark for review"
              >
                <Bookmark
                  size={16}
                  fill={bookmarkedSet.has(currentQuestion.id) ? '#f59e0b' : 'transparent'}
                />
              </button>

              <button
                onClick={handleFinishSession}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Submit Practice
              </button>
            </div>
          </div>

          {/* MAIN DUAL-PANE WORKSPACE */}
          <div
            className={`grid gap-5 ${isReadingSkill ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto'}`}
          >
            {/* LEFT PANE: READING PASSAGE (50% on desktop) */}
            {isReadingSkill && (
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[calc(100vh-210px)] overflow-hidden shadow-sm">
                {/* Passage Switcher Tabs */}
                {sessionPassages.length > 1 && (
                  <div className="flex border-b border-slate-800 bg-slate-950/80 px-3 pt-2.5 gap-2 overflow-x-auto">
                    {sessionPassages.map((pas, pIdx) => {
                      const isActive = pIdx === activePassageIndex;
                      return (
                        <button
                          key={pas.code}
                          onClick={() => {
                            setActivePassageIndex(pIdx);
                            // Also jump to first question in that passage
                            if (pas.questionIndices.length > 0) {
                              setCurrentIndex(pas.questionIndices[0]);
                            }
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-slate-900 text-sky-400 border-t-2 border-t-sky-400 border-x border-x-slate-800'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <FileText size={14} />
                          <span>Passage {pIdx + 1}</span>
                          <span className="text-[10px] opacity-70">
                            (Q{pas.questionIndices[0] + 1}–
                            {pas.questionIndices[pas.questionIndices.length - 1] + 1})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Passage Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-white">
                      {currentPassage?.title || 'Reading Passage'}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Reading Passage {activePassageIndex + 1} •{' '}
                      {currentPassage?.text ? currentPassage.text.trim().split(/\s+/).length : 0}{' '}
                      words
                    </span>
                  </div>
                  <Badge variant="info">IELTS Academic</Badge>
                </div>

                {/* Passage Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-4 leading-relaxed text-sm text-slate-200 font-serif selection:bg-sky-500/30">
                  {currentPassage?.text ? (
                    currentPassage.text.split('\n\n').map((paragraph, paraIdx) => (
                      <p
                        key={paraIdx}
                        className="leading-7 text-[15px] tracking-wide text-slate-200"
                      >
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <div className="text-slate-500 text-center py-10">
                      Passage content loading...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT PANE: QUESTION GROUP & INTERACTIVE TASK (50% on desktop) */}
            <div
              className={`${isReadingSkill ? 'lg:col-span-6' : ''} bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[calc(100vh-210px)] overflow-hidden shadow-sm`}
            >
              {/* Question Workspace Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* QUESTION GROUP INSTRUCTION BOX (Clean deduplicated header) */}
                {currentQuestion.groupInstructions && (
                  <div className="bg-slate-950 border border-sky-500/25 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle size={14} /> {currentQuestion.groupTitle || 'Question Group'}
                      </span>
                      <Badge variant="info">{currentQuestion.type || 'TASK'}</Badge>
                    </div>

                    {currentQuestion.contentTitle && (
                      <div className="text-xs font-bold text-amber-300">
                        {currentQuestion.contentTitle}
                      </div>
                    )}

                    <div className="text-xs text-slate-300 italic leading-relaxed">
                      {currentQuestion.groupInstructions}
                    </div>

                    {/* Shared Headings List for MATCHING_HEADINGS */}
                    {currentQuestion.sharedData?.headingsList && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 bg-slate-900/60 p-3 rounded-lg">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                          List of Headings
                        </div>
                        {currentQuestion.sharedData.headingsList.map((h: any) => (
                          <div
                            key={h.code}
                            className="text-xs text-slate-300 flex items-start gap-2"
                          >
                            <span className="font-bold text-sky-400 font-mono w-6">{h.code}</span>
                            <span>{h.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio player if listening */}
                {currentQuestion.audioUrl && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                      <Volume2 size={16} className="text-sky-400" /> Audio Prompt
                    </div>
                    <audio controls className="w-full h-8">
                      <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                {/* QUESTION PROMPT (Clean, without repeated group instruction headers) */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-md font-mono">
                      {currentQuestion.code}
                    </span>
                    <span>
                      Question {currentIndex + 1} of {activeSession.totalQuestions}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-relaxed pt-1">
                    {currentQuestion.text}
                  </h3>
                </div>

                {/* ============================================================
                    INTERACTIVE INPUT RENDERERS PER IELTS QUESTION TYPE
                    ============================================================ */}

                {/* 1. TRUE_FALSE_NOT_GIVEN / YES_NO_NOT_GIVEN Pill Selector */}
                {(currentQuestion.type === 'TRUE_FALSE_NOT_GIVEN' ||
                  currentQuestion.type === 'YES_NO_NOT_GIVEN') && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs text-slate-400 font-medium">
                      Select your statement verification:
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(currentQuestion.type === 'TRUE_FALSE_NOT_GIVEN'
                        ? ['TRUE', 'FALSE', 'NOT GIVEN']
                        : ['YES', 'NO', 'NOT GIVEN']
                      ).map((val) => {
                        const isSelected = selectedAnswer.toUpperCase() === val;
                        return (
                          <button
                            key={val}
                            onClick={() => handleSelectOption(val)}
                            className={`p-3.5 rounded-xl font-bold text-xs text-center transition-all border ${
                              isSelected
                                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.02]'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. MATCHING_HEADINGS Selector */}
                {currentQuestion.type === 'MATCHING_HEADINGS' && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs text-slate-400 font-medium">
                      Select the matching heading roman numeral:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'].map((num) => {
                        const isSelected = selectedAnswer.toLowerCase() === num;
                        return (
                          <button
                            key={num}
                            onClick={() => handleSelectOption(num)}
                            className={`p-3 rounded-xl font-mono font-bold text-xs text-center transition-all border ${
                              isSelected
                                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            Heading {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. MULTIPLE_CHOICE / MCQ Options */}
                {(currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'MCQ') &&
                  currentQuestion.options &&
                  currentQuestion.options.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs text-slate-400 font-medium">Choose ONE option:</div>
                      {currentQuestion.options.map((opt, idx) => {
                        const optLetter = String.fromCharCode(65 + idx);
                        const isSelected =
                          selectedAnswer === optLetter ||
                          selectedAnswer === opt ||
                          selectedAnswer.startsWith(`${optLetter}.`);

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(optLetter)}
                            className={`w-full text-left p-3.5 rounded-xl text-xs font-medium flex items-center gap-3.5 transition-all border ${
                              isSelected
                                ? 'bg-sky-500/15 border-sky-500 text-sky-300 shadow-sm'
                                : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-sky-500 text-slate-950 border-sky-500'
                                  : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {optLetter}
                            </div>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* 4. NOTE_COMPLETION / SUMMARY_COMPLETION / SENTENCE_COMPLETION / SHORT_ANSWER */}
                {(currentQuestion.type === 'NOTE_COMPLETION' ||
                  currentQuestion.type === 'SUMMARY_COMPLETION' ||
                  currentQuestion.type === 'SENTENCE_COMPLETION' ||
                  currentQuestion.type === 'COMPLETION' ||
                  currentQuestion.type === 'SHORT_ANSWER' ||
                  currentQuestion.type === 'FILL_IN_BLANK' ||
                  currentQuestion.type === 'MATCHING_INFORMATION') && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Type your exact answer below:</span>
                      <span className="text-sky-400 font-mono">
                        {currentQuestion.type === 'MATCHING_INFORMATION'
                          ? 'Paragraph letter (e.g. A, B, C...)'
                          : 'NO MORE THAN TWO WORDS'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(e) => handleSelectOption(e.target.value)}
                      placeholder={
                        currentQuestion.type === 'MATCHING_INFORMATION'
                          ? 'e.g. F'
                          : 'e.g. termination shock'
                      }
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-all font-sans"
                    />
                  </div>
                )}

                {/* Writing Task TextArea */}
                {isWritingSkill && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={8}
                      value={textAnswer}
                      onChange={(e) => handleSelectOption(e.target.value)}
                      placeholder="Compose your IELTS essay response here..."
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                    />
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      Words: {textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0}
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM NAVIGATION TOOLBAR & 40-QUESTION MATRIX */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
                {/* 40-Question Navigation Grid */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {activeSession.questions.map((q, qIdx) => {
                    const isCurrent = qIdx === currentIndex;
                    const isAnswered = Boolean(sessionAnswers[q.id]?.userAnswer);
                    const isBookmarked = bookmarkedSet.has(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(qIdx)}
                        className={`min-w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center relative ${
                          isCurrent
                            ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-950'
                            : isAnswered
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {qIdx + 1}
                        {isBookmarked && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {Object.keys(sessionAnswers).length} of {activeSession.totalQuestions} Answered
                  </div>

                  {currentIndex < activeSession.totalQuestions - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(activeSession.totalQuestions - 1, prev + 1)
                        )
                      }
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishSession}
                      disabled={loading}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {loading ? 'Evaluating...' : 'Complete Test →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: SESSION REVIEW & OFFICIAL BAND SCORE SCREEN
          ========================================================================= */}
      {stage === 'REVIEW' && activeSession && (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Official Band Score Card */}
          <div className="bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Practice Assessment Complete
            </span>

            <div>
              <div className="text-5xl font-black text-white tracking-tight">
                {activeSession.scoreResult?.bandOrScale || 'Band 7.5'}
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-1">
                {activeSession.scoreResult?.label || 'Good User'} • Raw Score:{' '}
                {activeSession.scoreResult?.rawScore || 0} / {activeSession.totalQuestions} (
                {activeSession.scoreResult?.percentage || 0}%)
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setStage('SKILL_SELECT')}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
              >
                <RotateCcw size={15} /> Back to Practice Hub
              </button>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Question-by-Question Diagnostic Review
            </h3>

            <div className="space-y-3">
              {activeSession.questions.map((q, idx) => {
                const ans = sessionAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-sky-400 font-bold">
                        Q{idx + 1} ({q.code}) • {q.type}
                      </span>
                      <span className="text-slate-400">{q.difficulty}</span>
                    </div>

                    <div className="text-sm text-white font-medium">{q.text}</div>

                    <div className="text-xs flex items-center gap-2 pt-1">
                      <span className="text-slate-400">Your Answer:</span>
                      <span className="font-bold text-sky-300 font-mono">
                        {ans?.userAnswer || 'Unanswered'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdaptivePracticeScreen;
