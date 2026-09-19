'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { Shield, Award, CheckCircle2 } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="w-full bg-bg-neutral border-t border-slate-200 text-[#475569] text-xs">
      <div className="max-w-360 mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <LogoBadge size="sm" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-deep-navy tracking-tight leading-none">
                  Clasptek Prep Portal
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569] mt-0.5">
                  Standardized Assessment Engine
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#475569] leading-relaxed max-w-sm mt-1">
              Enterprise standardized test preparation for IELTS, SAT, TOEFL and CELPIP. Cryptographically
              verified diagnostics, authentic timed mock simulations, and dual-rubric scoring.
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-deep-navy">
              <span className="inline-flex items-center gap-1 font-bold text-[#045EAD]">
                <Shield size={13} />
                ISO/IEC 23988 Protocol
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Award size={13} />
                Academic Benchmark
              </span>
            </div>
          </div>

          {/* Examinations */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-deep-navy">
              Examination Tracks
            </span>
            <Link href="/examinations" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              IELTS Academic &amp; General
            </Link>
            <Link href="/examinations" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              SAT Digital (Adaptive)
            </Link>
            <Link href="/examinations" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              TOEFL iBT Standard
            </Link>
            <Link href="/examinations" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              CELPIP General Training
            </Link>
          </div>

          {/* Assessment & Preparation */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-deep-navy">
              Preparation
            </span>
            <Link href="/register" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Diagnostic Pre-Assessment
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Timed Mock Examinations
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Official Band Descriptors
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Score Calibration &amp; Analytics
            </Link>
          </div>

          {/* Institutional & Legal */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-deep-navy">
              Account &amp; Security
            </span>
            <Link href="/login" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Student Sign In
            </Link>
            <Link href="/register" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Register Candidate Account
            </Link>
            <Link href="/forgot-password" className="text-slate-600 hover:text-deep-navy font-medium no-underline transition-colors">
              Password Recovery
            </Link>
            <span className="text-slate-600 font-medium">Strict RLS Data Isolation</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Clasptek Prep Portal. All rights reserved. Registered under ISO/IEC 23988.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/examinations" className="hover:text-deep-navy no-underline transition-colors">
              Curriculum Matrix
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-deep-navy no-underline transition-colors">
              Security Protocol
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
