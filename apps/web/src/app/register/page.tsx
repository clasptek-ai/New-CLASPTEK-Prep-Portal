'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 font-sans antialiased pt-10 sm:pt-12 md:pt-14 pb-16 relative overflow-x-hidden selection:bg-blue-500 selection:text-white"
      style={{
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 60%), #070b14',
      }}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header Section: Logo & Headline */}
      <div className="w-full max-w-[660px] flex flex-col items-center text-center mb-6 sm:mb-8 z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Logo */}
        <Link
          href="/"
          className="no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl mb-4 transition-transform hover:scale-105"
        >
          <LogoBadge size="lg" />
        </Link>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold text-slate-100 tracking-tight leading-tight m-0 mb-3">
          Create Your Student Account
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-[18px] font-medium text-slate-400 max-w-xl m-0 leading-relaxed">
          Prepare for IELTS, TOEFL, SAT and CELPIP with personalized AI-powered learning.
        </p>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 text-xs sm:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>Takes less than 2 minutes</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-sm">
            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
            <span>Secure account creation</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-sm">
            <Lock size={14} className="text-emerald-400 shrink-0" />
            <span>Email verification required</span>
          </div>
        </div>
      </div>

      {/* Main Registration Experience Card Container (Desktop 620-680px, Tablet 540px, Mobile 100% / max-w-480px) */}
      <div className="w-full max-w-[480px] sm:max-w-[540px] md:max-w-[660px] z-10 transition-all duration-300">
        <RegisterForm />
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 text-center text-xs sm:text-sm text-slate-400 z-10">
        <p className="m-0 font-medium">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-bold no-underline transition-colors focus:outline-none focus:underline inline-flex items-center gap-1"
          >
            <span>Sign In</span>
            <span>→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
