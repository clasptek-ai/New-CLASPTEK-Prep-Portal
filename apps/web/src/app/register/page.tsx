'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import {
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Sparkles,
  Award,
  BookOpen,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const BENEFIT_ITEMS = [
    {
      title: 'Personalized Diagnostic Assessment',
      desc: 'Adaptive baseline testing across Grammar, Reading, and Writing in under 20 mins.',
      icon: <Zap size={20} color="#fbbf24" />,
    },
    {
      title: 'Instant Placement Result',
      desc: 'Immediate CEFR level and predicted Band score breakdown upon completion.',
      icon: <Award size={20} color="#38bdf8" />,
    },
    {
      title: 'AI Learning Feedback',
      desc: 'Line-by-line syntax evaluation, modifier logic, and essay rubric feedback.',
      icon: <BrainCircuit size={20} color="#a78bfa" />,
    },
    {
      title: 'Personalized Study Plan',
      desc: 'Curriculum roadmap automatically tailored to your specific diagnostic gaps.',
      icon: <Target size={20} color="#34d399" />,
    },
    {
      title: 'Practice Sessions & Mock Exams',
      desc: 'Access 25,000+ practice items and official full-length timed exam simulations.',
      icon: <BookOpen size={20} color="#f87171" />,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1140px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left Panel: Guided Candidate Onboarding Experience */}
        <div style={{ padding: '0.5rem 1rem 0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem' }}>
            <LogoBadge size="lg" />
          </div>

          {/* Badges / Onboarding Notice */}
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem' }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Step 1 of 2 • Account & Pathway Setup
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Clock size={13} />
              Registration takes less than 2 minutes
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Prepare with Confidence
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Begin your diagnostic placement journey. Assessment begins immediately after profile
            completion.
          </p>

          {/* Benefit Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {BENEFIT_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  backgroundColor: '#111827',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#ffffff' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Notice */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px dashed rgba(59, 130, 246, 0.3)',
              fontSize: '0.825rem',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} className="shrink-0" />
            <span>Assessment begins immediately after profile completion.</span>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.875rem',
              color: '#94a3b8',
            }}
          >
            Already registered?{' '}
            <Link
              href="/login"
              style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In to Learning Portal →
            </Link>
          </div>
        </div>

        {/* Right Form Panel: Guided Onboarding Registration Form */}
        <div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
