'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, HelpCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { BrandConfig } from '@/config/brand.config';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { OnboardingState, StudentOnboardingData } from '../types/onboarding-state';

interface WelcomeGatewayScreenProps {
  onboardingData?: Partial<StudentOnboardingData>;
}

export const WelcomeGatewayScreen: React.FC<WelcomeGatewayScreenProps> = ({ onboardingData }) => {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [hasActiveAttempt, setHasActiveAttempt] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Assessment Definition Config from DB
  const [assessmentConfig, setAssessmentConfig] = useState<{
    id?: string;
    title?: string;
    description?: string;
    durationMinutes?: number;
    instructions?: string;
    sections?: any[];
    programme?: { id: string; name: string };
  }>({});

  const studentName = onboardingData?.firstName || 'Student';

  // State for post-login exam goals collection
  const [currentScore, setCurrentScore] = useState(onboardingData?.previousScore || '6.5');
  const [targetScore, setTargetScore] = useState(onboardingData?.targetScore || '8.0 Band');
  const [plannedTestDate, setPlannedTestDate] = useState(
    onboardingData?.plannedExamDate || '2026-09-15'
  );
  const [learningGoal, setLearningGoal] = useState(onboardingData?.purpose || 'Study Abroad');
  const [currentLevel, setCurrentLevel] = useState('Intermediate');

  // Load published assessment metadata and check active attempt from universal endpoint
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
        const res = await fetch('/api/v1/student/current-assessment');
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

    // Save complete learning profile
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
      const res = await fetch('/api/v1/assessment-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessmentConfig.id }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.error === 'DIAGNOSTIC_INSUFFICIENT_INVENTORY') {
          setErrorMessage(
            json.message ||
              'The assessment is temporarily unavailable due to question inventory constraints.'
          );
        } else {
          setErrorMessage(json.error || json.message || 'Failed to start assessment.');
        }
        setIsStarting(false);
        return;
      }

      const attemptId = json.data?.attemptId;
      router.push(`/student/assessments/player?attemptId=${encodeURIComponent(attemptId)}`);
    } catch (err: any) {
      console.error('Error starting assessment attempt:', err);
      setErrorMessage('Network error occurred. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Main Container */}
      <div
        style={{
          maxWidth: '780px',
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar with Logo */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            backgroundColor: '#161e2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <LogoBadge size="sm" />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#3b82f6',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} /> OFFICIAL PLACEMENT ASSESSMENT
          </span>
        </div>

        {/* Welcome & Intro Section */}
        <div style={{ padding: '2rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 0.5rem',
              color: '#ffffff',
              lineHeight: 1.25,
            }}
          >
            Welcome, {studentName}!
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: '0 0 1.75rem',
            }}
          >
            Determines your English proficiency level for placement into the appropriate English
            learning pathway.
          </p>

          {/* Error Banner if Inventory Insufficient or API Error */}
          {errorMessage && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <AlertCircle size={20} color="#ef4444" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Diagnostic Assessment Details Box */}
          <div
            style={{
              backgroundColor: '#1a2333',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: 0,
                  color: '#ffffff',
                }}
              >
                {assessmentConfig.title || 'Placement Assessment'}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#34d399',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  borderRadius: '4px',
                }}
              >
                {hasActiveAttempt ? 'RESUME ATTEMPT' : 'OFFICIAL PLACEMENT ASSESSMENT'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <Clock size={16} color="#3b82f6" />
                <span>
                  Duration: <strong style={{ color: '#ffffff' }}>{assessmentConfig.durationMinutes || 45} mins</strong> (Server Timer)
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <HelpCircle size={16} color="#3b82f6" />
                <span>
                  Programme: <strong style={{ color: '#ffffff' }}>{assessmentConfig.programme?.name || 'English Proficiency'}</strong>
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <ShieldCheck size={16} color="#3b82f6" />
                <span>
                  Purpose: <strong style={{ color: '#ffffff' }}>Placement & Skill Baseline</strong>
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                fontSize: '0.85rem',
                color: '#94a3b8',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              {assessmentConfig.sections ? (
                assessmentConfig.sections.map((sec: any, idx: number) => (
                  <div key={sec.name || idx}>
                    {sec.name}:{' '}
                    <strong style={{ color: idx === 0 ? '#38bdf8' : idx === 1 ? '#34d399' : '#a78bfa' }}>
                      {sec.questionCount ? `${sec.questionCount} Questions (${sec.selection || 'BALANCED'})` : sec.passages ? `${sec.passages} Reading Passage & Comprehension Set` : sec.tasks ? `${sec.tasks.length} Writing Tasks (${sec.tasks.join(' • ')})` : 'Configured Section'}
                    </strong>
                  </div>
                ))
              ) : (
                // RC1 Phase 4: Never show hardcoded section counts — show loading skeleton
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '1rem',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '4px',
                      width: i === 1 ? '70%' : i === 2 ? '55%' : '60%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Goal & Level Selectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.4rem',
                }}
              >
                Self-Assessed Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="Foundation">Foundation</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.4rem',
                }}
              >
                Primary Goal
              </label>
              <select
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="Study Abroad">Study Abroad</option>
                <option value="Career Advancement">Career Advancement</option>
                <option value="General Proficiency">General Proficiency</option>
                <option value="Immigration">Immigration</option>
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleStartDiagnostic}
            disabled={isStarting}
            style={{
              width: '100%',
              padding: '0.95rem 1.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isStarting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
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
