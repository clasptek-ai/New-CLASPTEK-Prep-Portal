'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, HelpCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { OnboardingState, StudentOnboardingData } from '../types/onboarding-state';
import { authFetch } from '@/lib/api-fetch';

interface WelcomeGatewayScreenProps {
  onboardingData?: Partial<StudentOnboardingData>;
}

export const WelcomeGatewayScreen: React.FC<WelcomeGatewayScreenProps> = ({ onboardingData }) => {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [hasActiveAttempt, setHasActiveAttempt] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [assessmentConfig, setAssessmentConfig] = useState<{
    id?: string;
    title?: string;
    description?: string;
    durationMinutes?: number;
    instructions?: string;
    sections?: any[];
    programme?: { id: string; name: string };
  }>({});

  const studentName = onboardingData?.firstName || 'Candidate';

  const [currentScore, setCurrentScore] = useState(onboardingData?.previousScore || '6.5');
  const [targetScore, setTargetScore] = useState(onboardingData?.targetScore || '8.0 Band');
  const [plannedTestDate, setPlannedTestDate] = useState(
    onboardingData?.plannedExamDate || '2026-09-15'
  );
  const [learningGoal, setLearningGoal] = useState(onboardingData?.purpose || 'Study Abroad');
  const [currentLevel, setCurrentLevel] = useState('Intermediate');

  useEffect(() => {
    if (onboardingData) {
      if (onboardingData.previousScore) setCurrentScore(onboardingData.previousScore);
      if (onboardingData.targetScore) setTargetScore(onboardingData.targetScore);
      if (onboardingData.plannedExamDate) setPlannedTestDate(onboardingData.plannedExamDate);
      if (onboardingData.purpose) setLearningGoal(onboardingData.purpose);
      if (onboardingData.baselineLevel) setCurrentLevel(onboardingData.baselineLevel);
    }

    async function loadCurrentAssessment() {
      try {
        const res = await authFetch('/api/v1/student/current-assessment');
        const json = await res.json();
        if (json.success && json.data) {
          const { assessment, hasActiveAttempt: active, activeAttemptId: attId } = json.data;
          setAssessmentConfig(assessment || {});
          if (active && attId) {
            setHasActiveAttempt(true);
            setActiveAttemptId(attId);
          }
        }
      } catch (err) {
        console.error('Failed to load current assessment metadata:', err);
      }
    }
    loadCurrentAssessment();
  }, [onboardingData]);

  const handleStartDiagnostic = async () => {
    setIsStarting(true);
    setErrorMessage(null);

    if (hasActiveAttempt && activeAttemptId) {
      router.push(`/student/assessments/player?attemptId=${encodeURIComponent(activeAttemptId)}`);
      return;
    }

    const updatedData: Partial<StudentOnboardingData> = {
      ...onboardingData,
      state: OnboardingState.DIAGNOSTIC_IN_PROGRESS,
      previousScore: currentScore,
      targetScore,
      plannedExamDate: plannedTestDate,
      purpose: learningGoal,
      baselineLevel: currentLevel,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('clasptek_onboarding_state', OnboardingState.DIAGNOSTIC_IN_PROGRESS);
      localStorage.setItem('clasptek_onboarding_data', JSON.stringify(updatedData));
    }

    try {
      const res = await authFetch('/api/v1/assessment-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessmentConfig.id }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || json.message || 'Failed to start assessment.');
        setIsStarting(false);
        return;
      }

      const attemptId = json.data?.attemptId || json.attemptId || json.data?.id || json.id;

      const isUuid =
        typeof attemptId === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId);

      if (!isUuid) {
        setErrorMessage('Failed to start assessment: Server returned an invalid attempt session.');
        setIsStarting(false);
        return;
      }

      router.push(`/student/assessments/player?attemptId=${encodeURIComponent(attemptId)}`);
    } catch {
      setErrorMessage('Network error occurred. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden cq-container">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <LogoBadge size="sm" />
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles size={14} />
            <span>OFFICIAL PLACEMENT ASSESSMENT</span>
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">
              Welcome, {studentName}!
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
              Determines your English proficiency baseline level for diagnostic placement into your
              pathway.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 flex items-center space-x-3 text-xs md:text-sm">
              <AlertCircle size={20} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Assessment Summary Box */}
          <div className="bg-slate-950 p-5 md:p-6 rounded-xl border border-sky-500/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white">
                {assessmentConfig.title || 'Placement Diagnostic Assessment'}
              </h2>
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 self-start sm:self-auto">
                {hasActiveAttempt ? 'RESUME ATTEMPT' : 'OFFICIAL PLACEMENT'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-sky-400 shrink-0" />
                <span>
                  Duration:{' '}
                  <strong className="text-white">
                    {assessmentConfig.durationMinutes || 45} mins
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <HelpCircle size={16} className="text-sky-400 shrink-0" />
                <span>
                  Programme:{' '}
                  <strong className="text-white">
                    {assessmentConfig.programme?.name || 'English Proficiency'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-sky-400 shrink-0" />
                <span>
                  Type: <strong className="text-white">Diagnostic Baseline</strong>
                </span>
              </div>
            </div>

            {/* Responsive Section Chips */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 mb-2">Section Outline:</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-sky-400">
                  Structure & Grammar (MCQ)
                </span>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
                  Reading Comprehension
                </span>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-purple-400">
                  Writing Expression
                </span>
              </div>
            </div>
          </div>

          {/* Goal Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Self-Assessed Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:border-sky-500 min-h-11"
              >
                <option value="Foundation">Foundation</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Primary Candidate Goal
              </label>
              <select
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:border-sky-500 min-h-11"
              >
                <option value="Study Abroad">Study Abroad</option>
                <option value="Career Advancement">Career Advancement</option>
                <option value="General Proficiency">General Proficiency</option>
                <option value="Immigration">Immigration</option>
              </select>
            </div>
          </div>

          {/* Full-width CTA Button */}
          <button
            onClick={handleStartDiagnostic}
            disabled={isStarting}
            className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl text-sm md:text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-500/20 min-h-12 touch-target"
          >
            <span>
              {isStarting
                ? 'Launching Assessment...'
                : hasActiveAttempt
                  ? 'Continue Diagnostic Assessment'
                  : 'Start Diagnostic Assessment'}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGatewayScreen;
