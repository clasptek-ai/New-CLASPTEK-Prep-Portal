'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export function LandingCTA() {
  return (
    <section id="register-cta" className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto mb-8 sm:mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-900/40 via-(--surface-0) to-(--surface-0) border border-blue-500/30 p-8 sm:p-14 text-center flex flex-col items-center gap-6 shadow-2xl">
        {/* Decorative backdrop glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
          Get Started in Less Than 2 Minutes
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-(--text-primary) max-w-2xl leading-tight m-0">
          Begin Your Diagnostic Assessment Today
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-(--text-secondary) max-w-xl leading-relaxed m-0">
          Complete your quick profile setup, take the placement diagnostic, and receive instant CEFR & Band predictions with a personalized study roadmap.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-(--text-secondary) my-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            Free Placement Diagnostic
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-400 shrink-0" />
            Instant Results & AI Plan
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400 shrink-0" />
            Takes &lt; 2 Minutes
          </span>
        </div>

        <Link href="/register" className="no-underline mt-2">
          <button
            type="button"
            className="bg-(--brand) hover:bg-(--brand-hover) text-white border-0 rounded-xl px-8 py-4 text-base sm:text-lg font-extrabold cursor-pointer flex items-center gap-3 shadow-xl shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Register & Start Assessment Now</span>
            <ArrowRight size={20} />
          </button>
        </Link>
      </div>
    </section>
  );
}
