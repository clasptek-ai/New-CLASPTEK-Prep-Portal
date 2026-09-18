'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '../../shared/ui/logo/LogoBadge';
import { BookOpen, Award, Brain, Shield, ArrowLeft } from 'lucide-react';

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const BRAND_FEATURES = [
  {
    icon: BookOpen,
    title: 'Standardized Learning Pathways',
    description: 'IELTS, TOEFL, SAT, CELPIP — expertly calibrated test preparation.',
  },
  {
    icon: Award,
    title: 'Diagnostic Baseline Engine',
    description: 'Pinpoint your proficiency baseline and uncover granular skill gaps.',
  },
  {
    icon: Brain,
    title: 'Dual-Rubric Scoring Model',
    description: 'Acoustic phonetic analysis and structural cohesion evaluation.',
  },
  {
    icon: Shield,
    title: 'Authentic Mock Examinations',
    description: 'Full-length, proctored simulations with strict server-authoritative timing.',
  },
];

export function AuthShell({ title, subtitle, maxWidth, children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-bg-neutral text-deep-navy font-sans">
      {/* ── LEFT BRAND PANEL (Desktop only) ── */}
      <div className="hidden md:flex flex-col justify-between p-8 lg:p-12 w-110 shrink-0 bg-deep-navy text-white min-h-screen border-r border-slate-800">
        {/* Logo */}
        <div>
          <LogoBadge size="md" href="/" ariaLabel="Go to Clasptek homepage" />
        </div>

        {/* Centre brand statement */}
        <div className="flex flex-col gap-8 my-auto py-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-bg-light-blue">
              Clasptek Prep Portal
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Prepare with purpose.
              <br />
              <span className="text-bg-light-blue">Test with confidence.</span>
            </h2>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed max-w-xs">
              Calibrated diagnostic assessments, authentic adaptive simulations, and dual-rubric scoring
              to guarantee benchmark achievement.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {BRAND_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-bg-light-blue mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight">{feature.title}</span>
                    <span className="text-[11px] text-slate-200 leading-relaxed mt-0.5">
                      {feature.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-slate-300">
          © {new Date().getFullYear()} Clasptek Global. ISO/IEC 23988 Compliant.
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden mb-6 flex flex-col items-center gap-2 text-center">
          <LogoBadge size="md" href="/" ariaLabel="Go to Clasptek homepage" />
          <p className="text-xs text-[#475569]">Standardized Test Preparation Platform</p>
        </div>

        {/* Form Card */}
        <div
          className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm transition-all"
          style={{ maxWidth: maxWidth || '440px' }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-deep-navy tracking-tight m-0">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed">{subtitle}</p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#475569] hover:text-[#045EAD] transition-colors no-underline"
          >
            <ArrowLeft size={13} />
            <span>Back to Clasptek Prep Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
