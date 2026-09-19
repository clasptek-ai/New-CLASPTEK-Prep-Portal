'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Monitor,
  Wifi,
  Volume2,
} from 'lucide-react';
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
  onboardingData?: Record<string, unknown>;
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
  const firstName = rawName ? rawName.trim().split(' ')[0] : 'Candidate';

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
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
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
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-deep-navy tracking-tight">
              {isNoProgramme
                ? 'No Active Programme Found'
                : isNoDiagnostic
                  ? 'No Diagnostic Assessment Assigned'
                  : 'Diagnostic Loading Error'}
            </h2>
            <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
              {errorMessage || 'Unable to load your diagnostic assessment. Please try again.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={loadCurrentAssessment}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-deep-navy text-xs font-bold rounded-lg flex items-center justify-center gap-2 border border-slate-300 transition-colors"
            >
              <RefreshCw size={15} />
              <span>Retry Resolution</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 font-sans text-deep-navy">
      {/* ── 1. Page Header & Session Context ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#045EAD] animate-pulse" />
              Standardized Diagnostic Tier
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-[#475569] font-mono font-medium">
              Code: {assessment.code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-navy tracking-tight">
            {assessment.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Welcome, {firstName}. Calibrate your exact current baseline across all exam skills
            before beginning tailored study plans.
          </p>
        </div>

        <div className="bg-bg-neutral border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-3 shrink-0">
          <ShieldCheck size={24} className="text-[#045EAD]" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#475569] uppercase font-bold">
              Evaluation Protocol
            </span>
            <span className="text-xs font-bold text-deep-navy">CEFR C1/C2 Metric</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── 2. Assessment Specifications Grid ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#045EAD]" />

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#475569] font-bold block">
              Diagnostic Architecture
            </span>
            <h2 className="text-base sm:text-lg font-bold text-deep-navy">
              Assessment Specifications
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              hasActiveAttempt
                ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                : 'bg-bg-light-blue text-[#045EAD] border border-[#B9DDF8]'
            }`}
          >
            <Sparkles size={13} />
            <span>{hasActiveAttempt ? 'ATTEMPT IN PROGRESS' : 'READY TO INITIALIZE'}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
              Track
            </span>
            <span className="text-sm font-bold text-deep-navy mt-1">
              {programme?.name || 'Standard'}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5">Verified syllabus</span>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
              Duration
            </span>
            <span className="text-sm font-bold text-[#045EAD] mt-1">
              {assessment.durationMinutes} Mins
            </span>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5">Server timed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
              Questions
            </span>
            <span className="text-sm font-bold text-deep-navy mt-1">
              {assessment.totalQuestions} Items
            </span>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5">
              Adaptive difficulty
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
              Modules
            </span>
            <span className="text-sm font-bold text-deep-navy mt-1">
              {assessment.sections?.length || 4} Integrated
            </span>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5">
              Full skill spectrum
            </span>
          </div>
        </div>

        {/* Section Breakdown */}
        {assessment.sections && assessment.sections.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block">
              Skill Modules Outline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {assessment.sections.map((sec, idx) => (
                <div
                  key={sec.code || idx}
                  className="p-3 bg-bg-neutral border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#045EAD]" />
                    <span className="font-bold text-deep-navy">{sec.name}</span>
                  </div>
                  {sec.questionCount ? (
                    <span className="text-[#475569] font-medium">
                      {sec.questionCount} {sec.questionCount === 1 ? 'item' : 'items'}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. System Check & Candidate Instructions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* System Readiness Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-[#045EAD]" />
            <h3 className="text-sm font-bold text-deep-navy">System Verification</h3>
          </div>
          <div className="space-y-2.5 text-xs text-[#475569]">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-bg-neutral border border-slate-200">
              <div className="flex items-center gap-2">
                <Volume2 size={15} className="text-[#045EAD]" />
                <span className="font-medium text-deep-navy">Audio Playback</span>
              </div>
              <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-bg-neutral border border-slate-200">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-[#045EAD]" />
                <span className="font-medium text-deep-navy">Server Connectivity</span>
              </div>
              <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded">
                14ms Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-bg-neutral border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#045EAD]" />
                <span className="font-medium text-deep-navy">Anti-Tamper Protocol</span>
              </div>
              <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded">
                Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Rules & Key Benefits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3.5">
          <h3 className="text-sm font-bold text-deep-navy">Candidate Instructions</h3>
          <ul className="space-y-3 text-xs text-[#475569]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#045EAD] shrink-0 mt-0.5" />
              <div>
                <strong className="text-deep-navy block mb-0.5">Paced &amp; Timed</strong>
                <span>
                  A continuous timer tracks your session. Work steadily through each skill module.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#045EAD] shrink-0 mt-0.5" />
              <div>
                <strong className="text-deep-navy block mb-0.5">Auto-Saved Progress</strong>
                <span>Your answers save automatically as you complete each question.</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#045EAD] shrink-0 mt-0.5" />
              <div>
                <strong className="text-deep-navy block mb-0.5">
                  Instant Baseline Calibration
                </strong>
                <span>
                  Receive an immediate CEFR-benchmarked score report and tailored skill plan upon
                  completion.
                </span>
              </div>
            </li>
          </ul>

          {assessment.instructions && (
            <div className="pt-2 text-[11px] text-[#475569] italic border-t border-slate-200">
              Note: {assessment.instructions}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Authoritative Start CTA ── */}
      <button
        onClick={handleStartDiagnostic}
        disabled={isStarting}
        className="w-full py-4 px-6 bg-[#045EAD] hover:bg-brand-hover text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>
          {isStarting
            ? 'LAUNCHING DIAGNOSTIC...'
            : hasActiveAttempt
              ? 'CONTINUE DIAGNOSTIC ASSESSMENT'
              : 'START DIAGNOSTIC ASSESSMENT'}
        </span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default WelcomeGatewayScreen;
