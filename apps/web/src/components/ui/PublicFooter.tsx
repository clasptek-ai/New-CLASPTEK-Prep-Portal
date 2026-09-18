'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { Shield, Award, CheckCircle2 } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#f8fafc] border-t border-slate-200 text-[#545f73] text-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <LogoBadge size="sm" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#131b2e] tracking-tight leading-none">
                  Clasptek Prep Portal
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#545f73] mt-0.5">
                  Standardized Assessment Engine
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#545f73] leading-relaxed max-w-sm mt-1">
              Enterprise standardized test preparation for IELTS, SAT, TOEFL and CELPIP. Cryptographically
              verified diagnostics, authentic timed mock simulations, and dual-rubric scoring.
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-[#131b2e]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#003c90]">
                <Shield size={13} />
                ISO/IEC 23988 Protocol
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1">
                <Award size={13} />
                Academic Benchmark
              </span>
            </div>
          </div>

          {/* Examinations */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-[#131b2e]">
              Examination Tracks
            </span>
            <Link href="/examinations" className="text-[#545f73] hover:text-[#003c90] no-underline">
              IELTS Academic &amp; General
            </Link>
            <Link href="/examinations" className="text-[#545f73] hover:text-[#003c90] no-underline">
              SAT Digital (Adaptive)
            </Link>
            <Link href="/examinations" className="text-[#545f73] hover:text-[#003c90] no-underline">
              TOEFL iBT Standard
            </Link>
            <Link href="/examinations" className="text-[#545f73] hover:text-[#003c90] no-underline">
              CELPIP General Training
            </Link>
          </div>

          {/* Assessment & Preparation */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-[#131b2e]">
              Preparation
            </span>
            <Link href="/register" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Diagnostic Pre-Assessment
            </Link>
            <Link href="/login" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Timed Mock Examinations
            </Link>
            <Link href="/login" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Official Band Descriptors
            </Link>
            <Link href="/login" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Score Calibration &amp; Analytics
            </Link>
          </div>

          {/* Institutional & Legal */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-[#131b2e]">
              Account &amp; Security
            </span>
            <Link href="/login" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Student Sign In
            </Link>
            <Link href="/register" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Register Candidate Account
            </Link>
            <Link href="/forgot-password" className="text-[#545f73] hover:text-[#003c90] no-underline">
              Password Recovery
            </Link>
            <span className="text-slate-400">Strict RLS Data Isolation</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Clasptek Prep Portal. All rights reserved. Authoritative Examination Platform.
          </div>
          <div className="flex items-center gap-4">
            <span>Server Deadline Enforced</span>
            <span>•</span>
            <span>Cryptographically Verified</span>
            <span>•</span>
            <span>CEFR Aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
