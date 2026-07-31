'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { BrandConfig } from '@/config/brand.config';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { getDiagnosticDefinition } from '../config/diagnostic-registry';
import { OnboardingState, StudentOnboardingData } from '../types/onboarding-state';

interface WelcomeGatewayScreenProps {
  onboardingData?: Partial<StudentOnboardingData>;
}

export const WelcomeGatewayScreen: React.FC<WelcomeGatewayScreenProps> = ({ onboardingData }) => {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const studentName = onboardingData?.firstName || 'Student';
  const targetExam = onboardingData?.targetExam || 'IELTS Academic';

  // State for post-login exam goals collection
  const [currentScore, setCurrentScore] = useState(onboardingData?.previousScore || '6.5');
  const [targetScore, setTargetScore] = useState(
    onboardingData?.targetScore ||
      (targetExam.includes('IELTS') ? '8.0 Band' : targetExam === 'SAT' ? '1450' : '105')
  );
  const [plannedTestDate, setPlannedTestDate] = useState(
    onboardingData?.plannedExamDate || '2026-09-15'
  );
  const [learningGoal, setLearningGoal] = useState(onboardingData?.purpose || 'Study Abroad');
  const [currentLevel, setCurrentLevel] = useState('Intermediate');

  // Sync state when onboardingData resolves on client mount
  React.useEffect(() => {
    if (onboardingData) {
      if (onboardingData.previousScore) setCurrentScore(onboardingData.previousScore);
      if (onboardingData.targetScore) setTargetScore(onboardingData.targetScore);
      if (onboardingData.plannedExamDate) setPlannedTestDate(onboardingData.plannedExamDate);
      if (onboardingData.purpose) setLearningGoal(onboardingData.purpose);
      if (onboardingData.baselineLevel) setCurrentLevel(onboardingData.baselineLevel);
    }
  }, [onboardingData]);

  const diagnosticDef = getDiagnosticDefinition(targetExam);

  const handleStartDiagnostic = () => {
    setIsStarting(true);

    // Save complete learning profile and set state = DIAGNOSTIC_IN_PROGRESS
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

    setTimeout(() => {
      router.push(`/student/assessments/player?examType=${encodeURIComponent(targetExam)}`);
    }, 600);
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
            <Sparkles size={13} />
            Learning Profile & Placement Gateway
          </span>
        </div>

        {/* Main Content Body */}
        <div style={{ padding: '2.25rem 2rem' }}>
          {/* Personalized Welcome Banner */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome, {studentName}!
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Welcome to{' '}
              <strong style={{ color: '#ffffff' }}>{BrandConfig.organizationName}</strong>.
              Let&apos;s personalize your learning experience before you begin.
            </p>
          </div>

          {/* Dynamic Diagnostic Metadata Box */}
          <div
            style={{
              backgroundColor: '#161e2e',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {diagnosticDef.title}
                </h4>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {diagnosticDef.description}
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                Placement Gate
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '1rem',
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
                  Duration:{' '}
                  <strong style={{ color: '#ffffff' }}>{diagnosticDef.durationMinutes} mins</strong>
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
                  Assessment Items:{' '}
                  <strong style={{ color: '#ffffff' }}>{diagnosticDef.questionCount}</strong>
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
                  Evaluates:{' '}
                  <strong style={{ color: '#ffffff' }}>
                    Grammar, Reading & Writing
                  </strong>
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
              }}
            >
              Grammar:{' '}
              <strong style={{ color: '#38bdf8' }}>
                Foundation • Intermediate • Advanced
              </strong>
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
            <span>{isStarting ? 'Launching Assessment...' : 'Start Diagnostic Assessment'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGatewayScreen;
