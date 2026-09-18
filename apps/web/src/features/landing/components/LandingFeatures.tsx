'use client';

import React from 'react';
import { BrainCircuit, Target, Zap } from 'lucide-react';

export function LandingFeatures() {
  const FEATURES = [
    {
      title: 'AI Learning Coach',
      desc: '24/7 intelligent tutor evaluating grammar modifiers, vocabulary syntax, and essay coherence with instant actionable feedback.',
      icon: <BrainCircuit size={24} className="text-sky-400" />,
    },
    {
      title: 'Personalized Study Plans',
      desc: 'Dynamic schedules automatically tailored to your baseline diagnostic gaps, target score, and exam deadline.',
      icon: <Target size={24} className="text-emerald-400" />,
    },
    {
      title: 'Diagnostic Assessments',
      desc: 'Adaptive baseline proficiency testing pinpointing your exact skill profile and weakness areas in under 20 minutes.',
      icon: <Zap size={24} className="text-amber-400" />,
    },
  ];

  return (
    <section
      id="why-choose-clasptek"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-(--border)"
    >
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase">
          Enterprise Preparation Architecture
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-(--text-primary) mt-2 mb-3">
          Why Choose Clasptek Global
        </h2>
        <p className="text-sm sm:text-base text-(--text-secondary) max-w-2xl mx-auto">
          Built with server-authoritative diagnostic engines, AI feedback, and official exam
          interfaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="bg-(--surface-0) border border-(--border) rounded-2xl p-6 sm:p-7 flex flex-col gap-4 hover:border-(--brand-border) transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-(--surface-1) border border-(--border) flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-lg font-bold text-(--text-primary) m-0">
              {feat.title}
            </h3>
            <p className="text-sm text-(--text-secondary) leading-relaxed m-0">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
