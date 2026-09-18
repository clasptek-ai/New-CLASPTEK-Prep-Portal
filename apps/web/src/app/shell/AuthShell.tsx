'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '../../shared/ui/logo/LogoBadge';
import { BookOpen, Award, Brain, Shield } from 'lucide-react';

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const BRAND_FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Learning Programmes',
    description: 'IELTS, TOEFL, SAT, CELPIP — expertly designed preparation pathways.',
  },
  {
    icon: Award,
    title: 'Diagnostic Assessment Engine',
    description: 'Pinpoint your proficiency baseline and receive a personalised study plan.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Learning Assistant',
    description: 'Adaptive practice and intelligent feedback to accelerate your progress.',
  },
  {
    icon: Shield,
    title: 'Authentic Mock Examinations',
    description: 'Full-length, timed simulations that mirror official exam conditions.',
  },
];

export function AuthShell({ title, subtitle, maxWidth, children }: AuthShellProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row"
      style={{ backgroundColor: 'var(--bg-app)', fontFamily: 'var(--font-sans)' }}
    >
      {/* ── LEFT BRAND PANEL (Desktop only) ── */}
      <div
        className="hidden md:flex flex-col justify-between p-8 lg:p-12"
        style={{
          width: '440px',
          flexShrink: 0,
          backgroundColor: 'var(--surface-0)',
          borderRight: '1px solid var(--border)',
          minHeight: '100vh',
        }}
      >
        {/* Logo */}
        <div>
          <LogoBadge size="md" href="/" ariaLabel="Go to Clasptek homepage" />
        </div>

        {/* Centre brand statement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.625rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1.25,
              }}
            >
              Prepare smarter.
              <br />
              <span style={{ color: 'var(--brand-light)' }}>Achieve more.</span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '320px',
              }}
            >
              Clasptek Global is a professional technology-training and assessment platform
              built for serious candidates.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {BRAND_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      flexShrink: 0,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--brand-subtle)',
                      border: '1px solid var(--brand-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--brand-light)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {feature.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          © {new Date().getFullYear()} Clasptek Global. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8"
        style={{ minHeight: '100vh' }}
      >
        {/* Mobile: logo at top */}
        <div className="md:hidden mb-8 flex flex-col items-center gap-3">
          <LogoBadge size="md" href="/" ariaLabel="Go to Clasptek homepage" />
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Professional Training &amp; Assessment Platform
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            width: '100%',
            maxWidth: maxWidth || '420px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.375rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: '0.5rem 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>

        {/* Back to home link */}
        <div style={{ marginTop: '1.5rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            ← Back to Clasptek.com
          </Link>
        </div>
      </div>
    </div>
  );
}
