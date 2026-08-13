'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, HelpCircle, ArrowRight, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { authFetch } from '@/lib/api-fetch';

export interface AssessmentSectionInfo {
  code: string;
  name: string;
  questionCount?: number;
}

export interface CanonicalAssessmentMetadata {
  id: string;
  code: string;
  title: string;
  type: string;
  durationMinutes: number;
  totalQuestions: number;
  instructions: string;
  sections: AssessmentSectionInfo[];
}

export interface CanonicalProgrammeMetadata {
  id: string;
  name: string;
  examType: string;
}

export interface WelcomeGatewayScreenProps {
  onboardingData?: Record<string, any>;
}

export const WelcomeGatewayScreen: React.FC<WelcomeGatewayScreenProps> = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [hasActiveAttempt, setHasActiveAttempt] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);

  const [assessment, setAssessment] = useState<CanonicalAssessmentMetadata | null>(null);
  const [programme, setProgramme] = useState<CanonicalProgrammeMetadata | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load canonical current assessment metadata for authenticated student
  const loadCurrentAssessment = useCallback(async () => {
    setLoading(true);
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const res = await authFetch('/api/v1/student/current-assessment');
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorCode(json.error || 'API_ERROR');
        setErrorMessage(
          json.message ||
            (json.error === 'NO_ACTIVE_PROGRAMME'
              ? 'No active programme found for your student profile.'
              : json.error === 'NO_PUBLISHED_DIAGNOSTIC'
                ? 'No diagnostic assessment is currently assigned to your programme.'
                : 'Unable to load your diagnostic. Please try again.')
        );
        setLoading(false);
        return;
      }

      if (json.assessment && json.programme) {
        setAssessment(json.assessment);
        setProgramme(json.programme);
        if (json.hasActiveAttempt && json.activeAttemptId) {
          setHasActiveAttempt(true);
          setActiveAttemptId(json.activeAttemptId);
        }
      } else {
        setErrorCode('NO_PUBLISHED_DIAGNOSTIC');
        setErrorMessage('No diagnostic assessment is currently assigned to your programme.');
      }
    } catch (err) {
      console.error('Failed to load current assessment metadata:', err);
      setErrorCode('API_ERROR');
      setErrorMessage('Unable to load your diagnostic. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadCurrentAssessment();
    }
  }, [authLoading, loadCurrentAssessment]);

  // Extract first name from authenticated user profile with zero fake text fallback
  const rawName = user?.name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || '';
  const firstName = rawName ? rawName.trim().split(' ')[0] : '';

  // Idempotent attempt creation/resumption handler
  const handleStartDiagnostic = async () => {
    if (!assessment) return;

    setIsStarting(true);
    setErrorMessage(null);

    // If an active attempt already exists for this diagnostic, resume directly
    if (hasActiveAttempt && activeAttemptId) {
      router.push(`/student/assessments/player?attemptId=${encodeURIComponent(activeAttemptId)}`);
      return;
    }

    try {
      const res = await authFetch('/api/v1/assessment-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessment.id }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.message || json.error || 'Failed to start assessment attempt.');
        setIsStarting(false);
        return;
      }

      const attemptId = json.data?.attemptId || json.attemptId || json.data?.id || json.id;

      if (!attemptId) {
        setErrorMessage('Failed to start assessment: Server returned an invalid attempt session.');
        setIsStarting(false);
        return;
      }

      router.push(`/student/assessments/player?attemptId=${encodeURIComponent(attemptId)}`);
    } catch (err) {
      console.error('Error starting diagnostic attempt:', err);
      setErrorMessage('Network error occurred while launching assessment. Please try again.');
      setIsStarting(false);
    }
  };

  // Render loading skeleton state while profile/assessment configuration bootstraps
  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-2">
        {/* Welcome Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-800/60 rounded-md" />
        </div>

        {/* Card Skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-slate-800 rounded" />
            <div className="h-6 w-32 bg-slate-800 rounded-full" />
          </div>
          <div className="h-7 w-80 bg-slate-800 rounded" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="h-5 bg-slate-800/80 rounded" />
            <div className="h-5 bg-slate-800/80 rounded" />
            <div className="h-5 bg-slate-800/80 rounded" />
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-8 w-28 bg-slate-800 rounded-lg" />
            <div className="h-8 w-32 bg-slate-800 rounded-lg" />
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Render business error states (no programme, no diagnostic assigned, API error)
  if (errorCode || !assessment) {
    const isNoProgramme = errorCode === 'NO_ACTIVE_PROGRAMME';
    const isNoDiagnostic = errorCode === 'NO_PUBLISHED_DIAGNOSTIC';

    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {isNoProgramme
                ? 'No Active Programme Found'
                : isNoDiagnostic
                  ? 'No Diagnostic Assessment Assigned'
                  : 'Diagnostic Loading Error'}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {errorMessage || 'Unable to load your diagnostic assessment. Please try again.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={loadCurrentAssessment}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors min-h-11"
            >
              <RefreshCw size={16} />
              <span>Retry Resolution</span>
            </button>
            <button
              onClick={() => router.push('/student')}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 transition-colors min-h-11 shadow-md shadow-sky-500/20"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2 md:p-4 font-sans text-slate-100">
      {/* 1. WELCOME SECTION */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Welcome, {firstName || 'Student'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
          Let&apos;s establish your current level so we can personalize your preparation.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 flex items-center space-x-3 text-xs md:text-sm">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. YOUR DIAGNOSTIC SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Programme Badge & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {programme?.name || 'Academic Programme'}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-0.5">{assessment.title}</h2>
          </div>
          <span
            className={`inline-flex items-center space-x-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border self-start sm:self-auto ${
              hasActiveAttempt
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
            }`}
          >
            <Sparkles size={14} />
            <span>{hasActiveAttempt ? 'RESUME DIAGNOSTIC' : 'PLACEMENT DIAGNOSTIC'}</span>
          </span>
        </div>

        {/* Assessment Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <Clock size={18} className="text-sky-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Duration</div>
              <strong className="text-white text-xs">{assessment.durationMinutes} mins</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <HelpCircle size={18} className="text-sky-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Questions</div>
              <strong className="text-white text-xs">
                {assessment.totalQuestions} items
              </strong>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <ShieldCheck size={18} className="text-sky-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Assessment Type</div>
              <strong className="text-white text-xs">Placement Diagnostic</strong>
            </div>
          </div>
        </div>

        {/* Configuration-driven Section Pills */}
        {assessment.sections && assessment.sections.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sections Outline
            </div>
            <div className="flex flex-wrap gap-2">
              {assessment.sections.map((sec, idx) => (
                <span
                  key={sec.code || idx}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5"
                >
                  <CheckCircle2 size={13} className="text-sky-400 shrink-0" />
                  <span>{sec.name}</span>
                  {sec.questionCount ? (
                    <span className="text-slate-400 font-normal">
                      ({sec.questionCount} {sec.questionCount === 1 ? 'item' : 'items'})
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BEFORE YOU START SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Before You Start
        </h3>

        <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
          <li className="flex items-start space-x-2.5">
            <span className="text-sky-400 font-bold">•</span>
            <span>Complete the assessment independently to ensure accurate placement.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-sky-400 font-bold">•</span>
            <span>Find a quiet environment free from distractions.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-sky-400 font-bold">•</span>
            <span>Follow the allotted time of {assessment.durationMinutes} minutes.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-sky-400 font-bold">•</span>
            <span>Read each section&apos;s instructions carefully before submitting answers.</span>
          </li>
        </ul>

        {assessment.instructions && (
          <div className="pt-2 text-xs text-slate-400 italic border-t border-slate-800/80">
            Note: {assessment.instructions}
          </div>
        )}
      </div>

      {/* 4. START ACTION CTA */}
      <button
        onClick={handleStartDiagnostic}
        disabled={isStarting}
        className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-2xl text-sm md:text-base flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-sky-500/25 min-h-14 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
      >
        <span>
          {isStarting
            ? 'Launching Assessment...'
            : hasActiveAttempt
              ? 'Continue Diagnostic Assessment'
              : 'Start Diagnostic Assessment'}
        </span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default WelcomeGatewayScreen;

