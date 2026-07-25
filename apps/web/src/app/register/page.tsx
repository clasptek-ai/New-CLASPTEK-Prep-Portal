'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1080px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left Hero Panel: Purpose-driven registration messaging */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <LogoBadge size="lg" />
          </div>

          <h1
            style={{
              fontSize: '2.35rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Prepare with Confidence. <br />
            <span style={{ color: '#3b82f6' }}>Achieve Your Goals.</span>
          </h1>

          <p
            style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}
          >
            Join Clasptek Global and prepare for IELTS, TOEFL, SAT, CELPIP, and English Proficiency
            with personalized diagnostics, AI-powered study plans, expert guidance, and realistic
            mock examinations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              'Evidence-based Diagnostic Assessments for tailored level placement',
              'AI Study Plans generated directly from actual skill gap metrics',
              'Realistic examination environments matching official test specifications',
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.925rem',
                  color: '#cbd5e1',
                }}
              >
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.875rem',
              color: '#94a3b8',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In to Portal
            </Link>
          </div>
        </div>

        {/* Right Form Panel: Streamlined 2-Step Registration Form */}
        <div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
