'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, Users, Award, FileText, TrendingUp } from 'lucide-react';

export function LandingHero() {
  const STATS = [
    {
      label: 'Students Enrolled',
      value: '15,000+',
      sub: 'Candidates in 45+ Countries',
      icon: <Users size={20} className="text-sky-400" />,
    },
    {
      label: 'Mock Tests Completed',
      value: '85,000+',
      sub: 'Full-Length Timed Simulations',
      icon: <Award size={20} className="text-indigo-400" />,
    },
    {
      label: 'Practice Questions',
      value: '25,000+',
      sub: 'Curated Bank with AI Feedback',
      icon: <FileText size={20} className="text-emerald-400" />,
    },
    {
      label: 'Success Rate',
      value: '98.4%',
      sub: 'Target Band Score Achievement',
      icon: <TrendingUp size={20} className="text-amber-400" />,
    },
  ];

  return (
    <section
      id="hero"
      className="relative px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center"
    >
      {/* Background glow subtle effect */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 sm:w-150 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Trust Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
        <Sparkles size={14} className="text-blue-400" />
        <span>AI-POWERED PREPARATION FOR IELTS, TOEFL, SAT & CELPIP</span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--text-primary) max-w-4xl mb-5 leading-tight">
        Prepare Smarter.{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-sky-300">
          Achieve Higher Scores.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-base sm:text-lg md:text-xl text-(--text-secondary) max-w-2xl leading-relaxed mb-8 sm:mb-10">
        Master IELTS, TOEFL, SAT, CELPIP, and English Proficiency with AI-powered learning,
        personalized study plans, realistic mock examinations, and expert guidance.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
        <Link href="/register" className="no-underline">
          <button
            type="button"
            className="bg-(--brand) hover:bg-(--brand-hover) text-white border-0 rounded-xl px-7 py-3.5 text-base font-bold cursor-pointer flex items-center gap-2.5 shadow-xl shadow-blue-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Start Your Diagnostic Assessment</span>
            <ArrowRight size={18} />
          </button>
        </Link>

        <a href="#programmes" className="no-underline">
          <button
            type="button"
            className="bg-(--surface-1) hover:bg-(--surface-2) text-(--text-primary) border border-(--border) rounded-xl px-7 py-3.5 text-base font-bold cursor-pointer flex items-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <BookOpen size={18} className="text-blue-400" />
            <span>Explore Programmes</span>
          </button>
        </a>
      </div>

      {/* Quick Stats Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 bg-(--surface-0) border border-(--border) rounded-2xl shadow-md">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-3.5 bg-(--surface-1)/70 rounded-xl border border-(--border)"
          >
            <div className="p-2.5 rounded-lg bg-(--surface-0) shrink-0 border border-(--border)">
              {stat.icon}
            </div>
            <div className="text-left min-w-0">
              <div className="text-xl font-black text-(--text-primary) tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-(--text-secondary) truncate">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
